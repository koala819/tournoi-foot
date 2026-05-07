const nodemailer = require("nodemailer");

function isValidEmail(value) {
  const s = String(value || "").trim();
  if (s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return json(200, { ok: true });
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Methode non autorisee." });
  }

  try {
    const {
      lastName,
      firstName,
      legalGuardianLastName,
      legalGuardianFirstName,
      childGender,
      contactEmail
    } = JSON.parse(
      event.body || "{}"
    );

    const genderNorm = String(childGender || "").trim();
    const allowedGender = new Set(["Fille", "Garçon"]);
    const emailTo = String(contactEmail || "").trim();

    if (!lastName || !firstName || !legalGuardianLastName || !legalGuardianFirstName || !genderNorm || !emailTo) {
      return json(400, { error: "Tous les champs sont obligatoires." });
    }

    if (!allowedGender.has(genderNorm)) {
      return json(400, { error: "Valeur de genre invalide." });
    }

    if (!isValidEmail(emailTo)) {
      return json(400, { error: "Adresse e-mail invalide." });
    }

    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      MAIL_TO
    } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_TO) {
      return json(500, { error: "Configuration SMTP incomplete." });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });

    const mailText = [
      `Nom : ${String(lastName).trim()}`,
      `Prénom : ${String(firstName).trim()}`,
      `Genre : ${genderNorm}`,
      `NOM Responsable légal : ${String(legalGuardianLastName).trim()}`,
      `Prénom Responsable légal : ${String(legalGuardianFirstName).trim()}`,
      `E-mail (destinataire) : ${emailTo}`
    ].join("\n");

    await transporter.sendMail({
      from: SMTP_USER,
      to: emailTo,
      bcc: MAIL_TO,
      subject: "Nouvelle inscription sortie promenade",
      text: mailText
    });

    return json(200, { ok: true });
  } catch (error) {
    return json(500, {
      error: "Erreur serveur lors de l'envoi du mail.",
      details: error.message
    });
  }
};
