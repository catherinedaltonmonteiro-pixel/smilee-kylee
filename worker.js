const ALLOWED_FOLDERS = [
  "inbox",
  "next",
  "work",
  "future",
  "backburner"
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      // ----------------------------------------------------
      // PUBLIC QUESTION SUBMISSION
      // ----------------------------------------------------
      if (url.pathname === "/api/questions" && request.method === "POST") {
        return await submitQuestion(request, env);
      }

      // ----------------------------------------------------
      // ADMIN LOGIN
      // ----------------------------------------------------
      if (url.pathname === "/api/admin/login" && request.method === "POST") {
        return await adminLogin(request, env);
      }

      // ----------------------------------------------------
      // ADMIN - VIEW SUBMISSIONS
      // ----------------------------------------------------
      if (
        url.pathname === "/api/admin/submissions" &&
        request.method === "GET"
      ) {
        if (!(await isAdmin(request, env))) {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }

        return await getSubmissions(request, env);
      }

      // ----------------------------------------------------
      // ADMIN - MOVE SUBMISSION
      // ----------------------------------------------------
      const moveMatch = url.pathname.match(
        /^\/api\/admin\/submissions\/(\d+)\/move$/
      );

      if (moveMatch && request.method === "POST") {
        if (!(await isAdmin(request, env))) {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }

        return await moveSubmission(
          request,
          env,
          Number(moveMatch[1])
        );
      }

      // ----------------------------------------------------
      // ADMIN - DELETE SUBMISSION
      // ----------------------------------------------------
      const deleteMatch = url.pathname.match(
        /^\/api\/admin\/submissions\/(\d+)$/
      );

      if (deleteMatch && request.method === "DELETE") {
        if (!(await isAdmin(request, env))) {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }

        return await deleteSubmission(
          env,
          Number(deleteMatch[1])
        );
      }

      // ----------------------------------------------------
      // SERVE NORMAL WEBSITE FILES
      // ----------------------------------------------------
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }

      return new Response("Not Found", { status: 404 });

    } catch (error) {
      console.error(error);

      return jsonResponse(
        {
          error: "Something went wrong. Please try again."
        },
        500
      );
    }
  }
};


// ========================================================
// PUBLIC SUBMISSION
// ========================================================

async function submitQuestion(request, env) {
  const data = await request.json();

  const name = cleanText(data.name, 100);
  const question = cleanText(data.question, 2000);
  const commentary = cleanText(data.commentary, 4000);

  if (!question) {
    return jsonResponse(
      {
        error: "Please enter the question you would like answered or addressed."
      },
      400
    );
  }

  await env.DB.prepare(`
    INSERT INTO submissions
    (name, question, commentary, folder)
    VALUES (?, ?, ?, 'inbox')
  `)
    .bind(
      name || null,
      question,
      commentary || null
    )
    .run();

  return jsonResponse({
    success: true,
    message: "Your question has been submitted."
  });
}


// ========================================================
// ADMIN LOGIN
// ========================================================

async function adminLogin(request, env) {
  await createSecurityTable(env);

  const ip =
    request.headers.get("CF-Connecting-IP") ||
    "unknown";

  const status = await getLoginStatus(env, ip);

  if (status.locked) {
    return jsonResponse(
      {
        error:
          "Too many incorrect attempts. Please wait before trying again."
      },
      429
    );
  }

  const data = await request.json();
  const passcode = String(data.passcode || "").trim();

  if (!passcode) {
    return jsonResponse(
      { error: "Enter your passcode." },
      400
    );
  }

  if (passcode !== String(env.ADMIN_PASSCODE)) {
    await recordFailedLogin(env, ip);

    return jsonResponse(
      { error: "Incorrect passcode." },
      401
    );
  }

  await clearFailedLogins(env, ip);

  return jsonResponse({
    success: true
  });
}


// ========================================================
// CHECK ADMIN PASSCODE
// ========================================================

async function isAdmin(request, env) {
  const passcode =
    request.headers.get("X-Admin-Passcode");

  if (!passcode || !env.ADMIN_PASSCODE) {
    return false;
  }

  return String(passcode) ===
    String(env.ADMIN_PASSCODE);
}


// ========================================================
// GET SUBMISSIONS
// ========================================================

async function getSubmissions(request, env) {
  const url = new URL(request.url);

  const folder =
    url.searchParams.get("folder") || "inbox";

  if (!ALLOWED_FOLDERS.includes(folder)) {
    return jsonResponse(
      { error: "Invalid folder." },
      400
    );
  }

  const results = await env.DB.prepare(`
    SELECT
      id,
      name,
      question,
      commentary,
      folder,
      submitted_at
    FROM submissions
    WHERE folder = ?
    ORDER BY submitted_at DESC
  `)
    .bind(folder)
    .all();

  return jsonResponse({
    success: true,
    submissions: results.results || []
  });
}


// ========================================================
// MOVE SUBMISSION
// ========================================================

async function moveSubmission(
  request,
  env,
  submissionId
) {
  const data = await request.json();
  const folder = String(data.folder || "");

  if (!ALLOWED_FOLDERS.includes(folder)) {
    return jsonResponse(
      { error: "Invalid folder." },
      400
    );
  }

  const existing = await env.DB.prepare(`
    SELECT id
    FROM submissions
    WHERE id = ?
  `)
    .bind(submissionId)
    .first();

  if (!existing) {
    return jsonResponse(
      { error: "Submission not found." },
      404
    );
  }

  await env.DB.prepare(`
    UPDATE submissions
    SET folder = ?
    WHERE id = ?
  `)
    .bind(folder, submissionId)
    .run();

  return jsonResponse({
    success: true
  });
}


// ========================================================
// DELETE SUBMISSION
// ========================================================

async function deleteSubmission(
  env,
  submissionId
) {
  const existing = await env.DB.prepare(`
    SELECT id
    FROM submissions
    WHERE id = ?
  `)
    .bind(submissionId)
    .first();

  if (!existing) {
    return jsonResponse(
      { error: "Submission not found." },
      404
    );
  }

  await env.DB.prepare(`
    DELETE FROM submissions
    WHERE id = ?
  `)
    .bind(submissionId)
    .run();

  return jsonResponse({
    success: true
  });
}


// ========================================================
// LOGIN SECURITY
// ========================================================

async function createSecurityTable(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS admin_login_attempts (
      ip TEXT PRIMARY KEY,
      attempts INTEGER NOT NULL DEFAULT 0,
      last_attempt INTEGER NOT NULL DEFAULT 0
    )
  `).run();
}


async function getLoginStatus(env, ip) {
  const record = await env.DB.prepare(`
    SELECT attempts, last_attempt
    FROM admin_login_attempts
    WHERE ip = ?
  `)
    .bind(ip)
    .first();

  if (!record) {
    return { locked: false };
  }

  const now = Math.floor(Date.now() / 1000);

  const lockLength = 15 * 60;

  if (
    Number(record.attempts) >= 5 &&
    now - Number(record.last_attempt) < lockLength
  ) {
    return { locked: true };
  }

  if (
    Number(record.attempts) >= 5 &&
    now - Number(record.last_attempt) >= lockLength
  ) {
    await clearFailedLogins(env, ip);
  }

  return { locked: false };
}


async function recordFailedLogin(env, ip) {
  const now = Math.floor(Date.now() / 1000);

  await env.DB.prepare(`
    INSERT INTO admin_login_attempts
      (ip, attempts, last_attempt)
    VALUES (?, 1, ?)

    ON CONFLICT(ip)
    DO UPDATE SET
      attempts = attempts + 1,
      last_attempt = excluded.last_attempt
  `)
    .bind(ip, now)
    .run();
}


async function clearFailedLogins(env, ip) {
  await env.DB.prepare(`
    DELETE FROM admin_login_attempts
    WHERE ip = ?
  `)
    .bind(ip)
    .run();
}


// ========================================================
// HELPERS
// ========================================================

function cleanText(value, maxLength) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .trim()
    .slice(0, maxLength);
}


function jsonResponse(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type":
          "application/json; charset=UTF-8",
        "Cache-Control":
          "no-store"
      }
    }
  );
}
