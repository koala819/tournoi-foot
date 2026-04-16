const nodemailer = require("nodemailer");

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
    const { lastName, firstName, ageGroup } = JSON.parse(event.body || "{}");

    if (!lastName || !firstName || !ageGroup) {
      return json(400, { error: "Tous les champs sont obligatoires." });
    }

    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      MAIL_TO,
      MAIL_FROM
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
      "Nouvelle inscription au tournoi de foot",
      "",
      `Nom : ${String(lastName).trim()}`,
      `Prenom : ${String(firstName).trim()}`,
      `Tranche d'age : ${String(ageGroup).trim()}`,
      "",
      "Mosquee : Al'Ihsane",
      "Responsable : Mounir",
      "Contact : 06.01.02.03.04",
      "Mail : 3cmc@live.fr",
      "",
      "Date limite d'inscription : 30 avril 2026"
    ].join("\n");

    await transporter.sendMail({
      from: MAIL_FROM || SMTP_USER,
      to: MAIL_TO,
      subject: "Nouvelle inscription tournoi de foot",
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
