var __defProp = Object.defineProperty;
var __name = (target, value) =>
  __defProp(target, "name", { value, configurable: true });

var ALLOWED_FOLDERS = [
  "inbox",
  "next",
  "work",
  "future",
  "backburner"
];

var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      // QUESTIONS
      if (url.pathname === "/api/questions" && request.method === "POST") {
        return await submitQuestion(request, env);
      }

      // ADMIN LOGIN
      if (url.pathname === "/api/admin/login" && request.method === "POST") {
        return await adminLogin(request, env);
      }

      // QUESTION ADMIN
      if (
        url.pathname === "/api/admin/submissions" &&
        request.method === "GET"
      ) {
        const access = await getAccess(request, env);

        if (!access) {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }

        return await getSubmissions(request, env);
      }

      const moveMatch = url.pathname.match(
        /^\/api\/admin\/submissions\/(\d+)\/move$/
      );

      if (moveMatch && request.method === "POST") {
        const access = await getAccess(request, env);

        if (!access) {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }

        if (access.role !== "owner") {
          return jsonResponse(
            { error: "View-only access cannot move submissions." },
            403
          );
        }

        return await moveSubmission(
          request,
          env,
          Number(moveMatch[1])
        );
      }

      const deleteMatch = url.pathname.match(
        /^\/api\/admin\/submissions\/(\d+)$/
      );

      if (deleteMatch && request.method === "DELETE") {
        const access = await getAccess(request, env);

        if (!access) {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }

        if (access.role !== "owner") {
          return jsonResponse(
            { error: "View-only access cannot delete submissions." },
            403
          );
        }

        return await deleteSubmission(
          env,
          Number(deleteMatch[1])
        );
      }

      // ACCESS CODES
      if (
        url.pathname === "/api/admin/access-codes" &&
        request.method === "GET"
      ) {
        const access = await getAccess(request, env);

        if (!access || access.role !== "owner") {
          return jsonResponse(
            { error: "Owner access required." },
            403
          );
        }

        return await listAccessCodes(env);
      }

      if (
        url.pathname === "/api/admin/access-codes" &&
        request.method === "POST"
      ) {
        const access = await getAccess(request, env);

        if (!access || access.role !== "owner") {
          return jsonResponse(
            { error: "Owner access required." },
            403
          );
        }

        return await createViewerCode(request, env);
      }

      const accessCodeDeleteMatch = url.pathname.match(
        /^\/api\/admin\/access-codes\/(\d+)$/
      );

      if (
        accessCodeDeleteMatch &&
        request.method === "DELETE"
      ) {
        const access = await getAccess(request, env);

        if (!access || access.role !== "owner") {
          return jsonResponse(
            { error: "Owner access required." },
            403
          );
        }

        return await deleteViewerCode(
          env,
          Number(accessCodeDeleteMatch[1])
        );
      }

      // MEMORIES
      if (
        url.pathname === "/api/memories" &&
        request.method === "POST"
      ) {
        return await submitMemory(request, env);
      }

      if (
        url.pathname === "/api/memories" &&
        request.method === "GET"
      ) {
        return await getApprovedMemories(env);
      }

      const publicMemoryImageMatch = url.pathname.match(
        /^\/api\/memories\/(\d+)\/image$/
      );

      if (
        publicMemoryImageMatch &&
        request.method === "GET"
      ) {
        return await getApprovedMemoryImage(
          env,
          Number(publicMemoryImageMatch[1])
        );
      }

      if (
        url.pathname === "/api/admin/memories" &&
        request.method === "GET"
      ) {
        const access = await getAccess(request, env);

        if (!access) {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }

        const status =
          url.searchParams.get("status") || "pending";

        if (status === "approved") {
          return await getAdminApprovedMemories(env);
        }

        return await getPendingMemories(env);
      }

      const approveMemoryMatch = url.pathname.match(
        /^\/api\/admin\/memories\/(\d+)\/approve$/
      );

      if (
        approveMemoryMatch &&
        request.method === "POST"
      ) {
        const access = await getAccess(request, env);

        if (!access || access.role !== "owner") {
          return jsonResponse(
            { error: "Owner access required." },
            403
          );
        }

        return await approveMemory(
          env,
          Number(approveMemoryMatch[1])
        );
      }

      const denyMemoryMatch = url.pathname.match(
        /^\/api\/admin\/memories\/(\d+)\/deny$/
      );

      if (
        denyMemoryMatch &&
        request.method === "DELETE"
      ) {
        const access = await getAccess(request, env);

        if (!access || access.role !== "owner") {
          return jsonResponse(
            { error: "Owner access required." },
            403
          );
        }

        return await denyMemory(
          env,
          Number(denyMemoryMatch[1])
        );
      }

      const deleteApprovedMemoryMatch = url.pathname.match(
        /^\/api\/admin\/memories\/(\d+)\/delete$/
      );

      if (
        deleteApprovedMemoryMatch &&
        request.method === "DELETE"
      ) {
        const access = await getAccess(request, env);

        if (!access || access.role !== "owner") {
          return jsonResponse(
            { error: "Owner access required." },
            403
          );
        }

        return await deleteApprovedMemory(
          env,
          Number(deleteApprovedMemoryMatch[1])
        );
      }

      // SHELTER EXPERIENCES
      if (
        url.pathname === "/api/shelter-experiences" &&
        request.method === "POST"
      ) {
        return await submitShelterExperience(
          request,
          env
        );
      }

      if (
        url.pathname === "/api/shelter-experiences" &&
        request.method === "GET"
      ) {
        return await getApprovedShelterExperiences(env);
      }

      const shelterImageMatch = url.pathname.match(
        /^\/api\/shelter-experiences\/(\d+)\/image$/
      );

      if (
        shelterImageMatch &&
        request.method === "GET"
      ) {
        return await getApprovedShelterExperienceImage(
          env,
          Number(shelterImageMatch[1])
        );
      }

      if (
        url.pathname ===
          "/api/admin/shelter-experiences" &&
        request.method === "GET"
      ) {
        const access = await getAccess(request, env);

        if (!access) {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }

        const status =
          url.searchParams.get("status") || "pending";

        if (status === "approved") {
          return await getAdminApprovedShelterExperiences(
            env
          );
        }

        return await getPendingShelterExperiences(env);
      }

      const approveShelterMatch = url.pathname.match(
        /^\/api\/admin\/shelter-experiences\/(\d+)\/approve$/
      );

      if (
        approveShelterMatch &&
        request.method === "POST"
      ) {
        const access = await getAccess(request, env);

        if (!access || access.role !== "owner") {
          return jsonResponse(
            { error: "Owner access required." },
            403
          );
        }

        return await approveShelterExperience(
          env,
          Number(approveShelterMatch[1])
        );
      }

      const denyShelterMatch = url.pathname.match(
        /^\/api\/admin\/shelter-experiences\/(\d+)\/deny$/
      );

      if (
        denyShelterMatch &&
        request.method === "DELETE"
      ) {
        const access = await getAccess(request, env);

        if (!access || access.role !== "owner") {
          return jsonResponse(
            { error: "Owner access required." },
            403
          );
        }

        return await denyShelterExperience(
          env,
          Number(denyShelterMatch[1])
        );
      }

      const deleteShelterMatch = url.pathname.match(
        /^\/api\/admin\/shelter-experiences\/(\d+)\/delete$/
      );

      if (
        deleteShelterMatch &&
        request.method === "DELETE"
      ) {
        const access = await getAccess(request, env);

        if (!access || access.role !== "owner") {
          return jsonResponse(
            { error: "Owner access required." },
            403
          );
        }

        return await deleteApprovedShelterExperience(
          env,
          Number(deleteShelterMatch[1])
        );
      }

      // WEBSITE FILES
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }

      return new Response("Not Found", { status: 404 });
    } catch (error) {
      console.error(error);

      return jsonResponse(
        {
          error:
            "Something went wrong. Please try again."
        },
        500
      );
    }
  }
};

/* =========================
   QUESTIONS
========================= */

async function submitQuestion(request, env) {
  const data = await request.json();

  const name = cleanText(data.name, 100);
  const question = cleanText(data.question, 2000);
  const commentary = cleanText(data.commentary, 4000);

  if (!question) {
    return jsonResponse(
      {
        error:
          "Please enter the question you would like answered or addressed."
      },
      400
    );
  }

  await env.DB.prepare(`
    INSERT INTO submissions
    (
      name,
      question,
      commentary,
      folder
    )
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

/* =========================
   MEMORIES
========================= */

async function submitMemory(request, env) {
  const data = await request.json();

  const name = cleanText(data.name, 100);
  const memory = cleanText(data.memory, 4000);

  const imageData =
    typeof data.imageData === "string"
      ? data.imageData.trim()
      : "";

  if (!name) {
    return jsonResponse(
      { error: "Please enter your name." },
      400
    );
  }

  if (!memory) {
    return jsonResponse(
      { error: "Please share your memory of Kylee." },
      400
    );
  }

  const imageError = validateImage(imageData);

  if (imageError) {
    return jsonResponse(
      { error: imageError },
      400
    );
  }

  const inserted = await env.DB.prepare(`
    INSERT INTO memories
    (
      name,
      memory,
      status
    )
    VALUES (?, ?, 'pending')
    RETURNING id
  `)
    .bind(name, memory)
    .first();

  const memoryId = Number(inserted.id);

  if (imageData) {
    await env.DB.prepare(`
      INSERT INTO memory_images
      (
        memory_id,
        image_data
      )
      VALUES (?, ?)
    `)
      .bind(memoryId, imageData)
      .run();
  }

  return jsonResponse({
    success: true,
    message:
      "Thank you. Your memory has been sent for approval."
  });
}

async function getApprovedMemories(env) {
  const results = await env.DB.prepare(`
    SELECT
      m.id,
      m.name,
      m.memory,
      m.approved_at,
      CASE
        WHEN mi.memory_id IS NULL THEN 0
        ELSE 1
      END AS has_image
    FROM memories m
    LEFT JOIN memory_images mi
      ON mi.memory_id = m.id
    WHERE m.status = 'approved'
    ORDER BY RANDOM()
  `).all();

  return jsonResponse({
    success: true,
    memories: results.results || []
  });
}

async function getPendingMemories(env) {
  const results = await env.DB.prepare(`
    SELECT
      m.id,
      m.name,
      m.memory,
      m.submitted_at,
      mi.image_data
    FROM memories m
    LEFT JOIN memory_images mi
      ON mi.memory_id = m.id
    WHERE m.status = 'pending'
    ORDER BY m.submitted_at DESC
  `).all();

  return jsonResponse({
    success: true,
    memories: results.results || []
  });
}

async function getAdminApprovedMemories(env) {
  const results = await env.DB.prepare(`
    SELECT
      m.id,
      m.name,
      m.memory,
      m.submitted_at,
      m.approved_at,
      mi.image_data
    FROM memories m
    LEFT JOIN memory_images mi
      ON mi.memory_id = m.id
    WHERE m.status = 'approved'
    ORDER BY m.approved_at DESC
  `).all();

  return jsonResponse({
    success: true,
    memories: results.results || []
  });
}

async function getApprovedMemoryImage(env, memoryId) {
  const result = await env.DB.prepare(`
    SELECT mi.image_data
    FROM memory_images mi
    INNER JOIN memories m
      ON m.id = mi.memory_id
    WHERE mi.memory_id = ?
      AND m.status = 'approved'
    LIMIT 1
  `)
    .bind(memoryId)
    .first();

  return imageResponse(result);
}

async function approveMemory(env, memoryId) {
  const existing = await env.DB.prepare(`
    SELECT id
    FROM memories
    WHERE id = ?
      AND status = 'pending'
    LIMIT 1
  `)
    .bind(memoryId)
    .first();

  if (!existing) {
    return jsonResponse(
      { error: "Pending memory not found." },
      404
    );
  }

  await env.DB.prepare(`
    UPDATE memories
    SET
      status = 'approved',
      approved_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
    .bind(memoryId)
    .run();

  return jsonResponse({ success: true });
}

async function denyMemory(env, memoryId) {
  await env.DB.prepare(`
    DELETE FROM memory_images
    WHERE memory_id = ?
  `)
    .bind(memoryId)
    .run();

  await env.DB.prepare(`
    DELETE FROM memories
    WHERE id = ?
      AND status = 'pending'
  `)
    .bind(memoryId)
    .run();

  return jsonResponse({ success: true });
}

async function deleteApprovedMemory(env, memoryId) {
  await env.DB.prepare(`
    DELETE FROM memory_images
    WHERE memory_id = ?
  `)
    .bind(memoryId)
    .run();

  await env.DB.prepare(`
    DELETE FROM memories
    WHERE id = ?
      AND status = 'approved'
  `)
    .bind(memoryId)
    .run();

  return jsonResponse({ success: true });
}

/* =========================
   SHELTER EXPERIENCES
========================= */

async function ensureShelterExperienceTables(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS shelter_experiences
    (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      experience TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      submitted_at DATETIME NOT NULL
        DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME
    )
  `).run();

  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS shelter_experience_images
    (
      experience_id INTEGER PRIMARY KEY,
      image_data TEXT NOT NULL
    )
  `).run();
}

async function submitShelterExperience(request, env) {
  await ensureShelterExperienceTables(env);

  const data = await request.json();

  const name =
    cleanText(data.name, 100) || "Anonymous";

  const experience =
    cleanText(data.experience, 4000);

  const imageData =
    typeof data.imageData === "string"
      ? data.imageData.trim()
      : "";

  if (!experience) {
    return jsonResponse(
      {
        error:
          "Please share your shelter experience."
      },
      400
    );
  }

  const imageError = validateImage(imageData);

  if (imageError) {
    return jsonResponse(
      { error: imageError },
      400
    );
  }

  const inserted = await env.DB.prepare(`
    INSERT INTO shelter_experiences
    (
      name,
      experience,
      status
    )
    VALUES (?, ?, 'pending')
    RETURNING id
  `)
    .bind(name, experience)
    .first();

  const experienceId =
    Number(inserted.id);

  if (imageData) {
    await env.DB.prepare(`
      INSERT INTO shelter_experience_images
      (
        experience_id,
        image_data
      )
      VALUES (?, ?)
    `)
      .bind(experienceId, imageData)
      .run();
  }

  return jsonResponse({
    success: true,
    message:
      "Thank you. Your experience has been sent for approval."
  });
}

async function getApprovedShelterExperiences(env) {
  await ensureShelterExperienceTables(env);

  const results = await env.DB.prepare(`
    SELECT
      e.id,
      e.name,
      e.experience AS memory,
      e.approved_at,
      CASE
        WHEN i.experience_id IS NULL THEN 0
        ELSE 1
      END AS has_image
    FROM shelter_experiences e
    LEFT JOIN shelter_experience_images i
      ON i.experience_id = e.id
    WHERE e.status = 'approved'
    ORDER BY RANDOM()
  `).all();

  return jsonResponse({
    success: true,
    memories: results.results || []
  });
}

async function getPendingShelterExperiences(env) {
  await ensureShelterExperienceTables(env);

  const results = await env.DB.prepare(`
    SELECT
      e.id,
      e.name,
      e.experience AS memory,
      e.submitted_at,
      i.image_data
    FROM shelter_experiences e
    LEFT JOIN shelter_experience_images i
      ON i.experience_id = e.id
    WHERE e.status = 'pending'
    ORDER BY e.submitted_at DESC
  `).all();

  return jsonResponse({
    success: true,
    memories: results.results || []
  });
}

async function getAdminApprovedShelterExperiences(env) {
  await ensureShelterExperienceTables(env);

  const results = await env.DB.prepare(`
    SELECT
      e.id,
      e.name,
      e.experience AS memory,
      e.submitted_at,
      e.approved_at,
      i.image_data
    FROM shelter_experiences e
    LEFT JOIN shelter_experience_images i
      ON i.experience_id = e.id
    WHERE e.status = 'approved'
    ORDER BY e.approved_at DESC
  `).all();

  return jsonResponse({
    success: true,
    memories: results.results || []
  });
}

async function getApprovedShelterExperienceImage(
  env,
  experienceId
) {
  await ensureShelterExperienceTables(env);

  const result = await env.DB.prepare(`
    SELECT i.image_data
    FROM shelter_experience_images i
    INNER JOIN shelter_experiences e
      ON e.id = i.experience_id
    WHERE i.experience_id = ?
      AND e.status = 'approved'
    LIMIT 1
  `)
    .bind(experienceId)
    .first();

  return imageResponse(result);
}

async function approveShelterExperience(
  env,
  experienceId
) {
  await ensureShelterExperienceTables(env);

  const existing = await env.DB.prepare(`
    SELECT id
    FROM shelter_experiences
    WHERE id = ?
      AND status = 'pending'
    LIMIT 1
  `)
    .bind(experienceId)
    .first();

  if (!existing) {
    return jsonResponse(
      {
        error:
          "Pending experience not found."
      },
      404
    );
  }

  await env.DB.prepare(`
    UPDATE shelter_experiences
    SET
      status = 'approved',
      approved_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
    .bind(experienceId)
    .run();

  return jsonResponse({ success: true });
}

async function denyShelterExperience(
  env,
  experienceId
) {
  await ensureShelterExperienceTables(env);

  await env.DB.prepare(`
    DELETE FROM shelter_experience_images
    WHERE experience_id = ?
  `)
    .bind(experienceId)
    .run();

  await env.DB.prepare(`
    DELETE FROM shelter_experiences
    WHERE id = ?
      AND status = 'pending'
  `)
    .bind(experienceId)
    .run();

  return jsonResponse({ success: true });
}

async function deleteApprovedShelterExperience(
  env,
  experienceId
) {
  await ensureShelterExperienceTables(env);

  await env.DB.prepare(`
    DELETE FROM shelter_experience_images
    WHERE experience_id = ?
  `)
    .bind(experienceId)
    .run();

  await env.DB.prepare(`
    DELETE FROM shelter_experiences
    WHERE id = ?
      AND status = 'approved'
  `)
    .bind(experienceId)
    .run();

  return jsonResponse({ success: true });
}

/* =========================
   ADMIN LOGIN
========================= */

async function adminLogin(request, env) {
  await createSecurityTable(env);

  const ip =
    request.headers.get("CF-Connecting-IP") ||
    "unknown";

  const status =
    await getLoginStatus(env, ip);

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

  const passcode =
    String(data.passcode || "").trim();

  if (!passcode) {
    return jsonResponse(
      { error: "Enter your passcode." },
      400
    );
  }

  const access =
    await findAccessCode(env, passcode);

  if (!access) {
    await recordFailedLogin(env, ip);

    return jsonResponse(
      { error: "Incorrect passcode." },
      401
    );
  }

  await clearFailedLogins(env, ip);

  return jsonResponse({
    success: true,
    role: access.role,
    label: access.label || ""
  });
}

async function getAccess(request, env) {
  const passcode =
    request.headers.get(
      "X-Admin-Passcode"
    );

  if (!passcode) {
    return null;
  }

  return await findAccessCode(
    env,
    String(passcode).trim()
  );
}

async function findAccessCode(env, passcode) {
  if (!passcode) {
    return null;
  }

  const record = await env.DB.prepare(`
    SELECT
      id,
      role,
      label,
      active
    FROM access_codes
    WHERE passcode = ?
      AND active = 1
    LIMIT 1
  `)
    .bind(passcode)
    .first();

  if (!record) {
    return null;
  }

  return {
    id: Number(record.id),
    role: String(record.role),
    label:
      record.label
        ? String(record.label)
        : ""
  };
}

/* =========================
   QUESTION ADMIN
========================= */

async function getSubmissions(request, env) {
  const url = new URL(request.url);

  const folder =
    url.searchParams.get("folder") ||
    "inbox";

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

async function moveSubmission(
  request,
  env,
  submissionId
) {
  const data = await request.json();

  const folder =
    String(data.folder || "");

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

  return jsonResponse({ success: true });
}

async function deleteSubmission(
  env,
  submissionId
) {
  await env.DB.prepare(`
    DELETE FROM submissions
    WHERE id = ?
  `)
    .bind(submissionId)
    .run();

  return jsonResponse({ success: true });
}

/* =========================
   ACCESS CODES
========================= */

async function listAccessCodes(env) {
  const results = await env.DB.prepare(`
    SELECT
      id,
      role,
      label,
      active,
      created_at
    FROM access_codes
    ORDER BY created_at DESC
  `).all();

  return jsonResponse({
    success: true,
    accessCodes: results.results || []
  });
}

async function createViewerCode(request, env) {
  const data = await request.json();

  const label =
    cleanText(data.label, 100) ||
    "Viewer";

  let passcode =
    String(data.passcode || "").trim();

  if (!passcode) {
    passcode = createRandomPasscode();
  }

  if (!/^\d{6,12}$/.test(passcode)) {
    return jsonResponse(
      {
        error:
          "Viewer passcodes must contain 6 to 12 numbers."
      },
      400
    );
  }

  const duplicate = await env.DB.prepare(`
    SELECT id
    FROM access_codes
    WHERE passcode = ?
    LIMIT 1
  `)
    .bind(passcode)
    .first();

  if (duplicate) {
    return jsonResponse(
      {
        error:
          "That passcode is already being used."
      },
      409
    );
  }

  const result = await env.DB.prepare(`
    INSERT INTO access_codes
    (
      passcode,
      role,
      label,
      active
    )
    VALUES (?, 'viewer', ?, 1)
  `)
    .bind(passcode, label)
    .run();

  return jsonResponse({
    success: true,
    id:
      result.meta?.last_row_id ||
      null,
    passcode,
    role: "viewer",
    label
  });
}

async function deleteViewerCode(
  env,
  accessCodeId
) {
  const existing = await env.DB.prepare(`
    SELECT
      id,
      role
    FROM access_codes
    WHERE id = ?
    LIMIT 1
  `)
    .bind(accessCodeId)
    .first();

  if (!existing) {
    return jsonResponse(
      { error: "Access code not found." },
      404
    );
  }

  if (String(existing.role) === "owner") {
    return jsonResponse(
      {
        error:
          "The owner passcode cannot be deleted here."
      },
      403
    );
  }

  await env.DB.prepare(`
    DELETE FROM access_codes
    WHERE id = ?
      AND role = 'viewer'
  `)
    .bind(accessCodeId)
    .run();

  return jsonResponse({ success: true });
}

/* =========================
   SECURITY
========================= */

async function createSecurityTable(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS
    admin_login_attempts
    (
      ip TEXT PRIMARY KEY,
      attempts INTEGER
        NOT NULL DEFAULT 0,
      last_attempt INTEGER
        NOT NULL DEFAULT 0
    )
  `).run();
}

async function getLoginStatus(env, ip) {
  const record = await env.DB.prepare(`
    SELECT
      attempts,
      last_attempt
    FROM admin_login_attempts
    WHERE ip = ?
  `)
    .bind(ip)
    .first();

  if (!record) {
    return { locked: false };
  }

  const now =
    Math.floor(Date.now() / 1000);

  const lockLength =
    5 * 60;

  if (
    Number(record.attempts) >= 5 &&
    now - Number(record.last_attempt) <
      lockLength
  ) {
    return { locked: true };
  }

  if (
    Number(record.attempts) >= 5 &&
    now - Number(record.last_attempt) >=
      lockLength
  ) {
    await clearFailedLogins(env, ip);
  }

  return { locked: false };
}

async function recordFailedLogin(env, ip) {
  const now =
    Math.floor(Date.now() / 1000);

  await env.DB.prepare(`
    INSERT INTO admin_login_attempts
    (
      ip,
      attempts,
      last_attempt
    )
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

/* =========================
   HELPERS
========================= */

function createRandomPasscode() {
  const numbers =
    new Uint32Array(1);

  crypto.getRandomValues(numbers);

  const value =
    10000000 +
    (numbers[0] % 90000000);

  return String(value);
}

function cleanText(value, maxLength) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .slice(0, maxLength);
}

function validateImage(imageData) {
  if (!imageData) {
    return null;
  }

  const valid =
    /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(
      imageData
    );

  if (!valid) {
    return "The picture format is not supported.";
  }

  if (imageData.length > 1600000) {
    return "The picture is too large. Please choose a smaller picture.";
  }

  return null;
}

function imageResponse(result) {
  if (
    !result ||
    !result.image_data
  ) {
    return new Response(
      "Image not found.",
      { status: 404 }
    );
  }

  const match =
    String(result.image_data).match(
      /^data:image\/(jpeg|png|webp);base64,(.+)$/
    );

  if (!match) {
    return new Response(
      "Invalid image.",
      { status: 500 }
    );
  }

  const subtype = match[1];
  const binary = atob(match[2]);

  const bytes =
    new Uint8Array(binary.length);

  for (
    let index = 0;
    index < binary.length;
    index++
  ) {
    bytes[index] =
      binary.charCodeAt(index);
  }

  const contentType =
    subtype === "png"
      ? "image/png"
      : subtype === "webp"
      ? "image/webp"
      : "image/jpeg";

  return new Response(bytes, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control":
        "public, max-age=3600"
    }
  });
}

function jsonResponse(
  data,
  status = 200
) {
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

export {
  worker_default as default
};
