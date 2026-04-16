const form = document.getElementById("registration-form");
const message = document.getElementById("message");
const submitButton = form.querySelector(".submit-button");

function showMessage(text, isSuccess = false) {
  message.textContent = text;
  message.classList.toggle("success", isSuccess);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const lastName = String(formData.get("lastName") || "").trim();
  const firstName = String(formData.get("firstName") || "").trim();
  const ageGroup = String(formData.get("ageGroup") || "").trim();

  if (!lastName || !firstName || !ageGroup) {
    showMessage("Merci de remplir tous les champs.");
    return;
  }

  submitButton.disabled = true;
  showMessage("Envoi en cours...");

  try {
    const response = await fetch("/.netlify/functions/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        lastName,
        firstName,
        ageGroup
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erreur lors de l'envoi.");
    }

    showMessage("Inscription envoyee avec succes.", true);
    form.reset();
  } catch (error) {
    showMessage(error.message || "Impossible d'envoyer l'inscription.");
  } finally {
    submitButton.disabled = false;
  }
});
