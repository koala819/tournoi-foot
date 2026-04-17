const form = document.getElementById("registration-form");
const message = document.getElementById("message");
const submitButton = form.querySelector(".submit-button");
const successDialog = document.getElementById("success-dialog");
const successDialogOk = document.getElementById("success-dialog-ok");

function showMessage(text, isSuccess = false) {
  message.textContent = text;
  message.classList.toggle("success", isSuccess);
}

function showSuccessDialog() {
  if (successDialog && typeof successDialog.showModal === "function") {
    successDialog.showModal();
    if (successDialogOk) {
      successDialogOk.focus();
    }
    return;
  }

  alert("Votre inscription a bien ete enregistree.");
}

if (successDialog && successDialogOk) {
  successDialogOk.addEventListener("click", () => {
    successDialog.close();
  });

  successDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const lastName = String(formData.get("lastName") || "").trim();
  const firstName = String(formData.get("firstName") || "").trim();
  const legalGuardianLastName = String(formData.get("legalGuardianLastName") || "").trim();
  const legalGuardianFirstName = String(formData.get("legalGuardianFirstName") || "").trim();
  const ageGroup = String(formData.get("ageGroup") || "").trim();

  if (!lastName || !firstName || !legalGuardianLastName || !legalGuardianFirstName || !ageGroup) {
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
        legalGuardianLastName,
        legalGuardianFirstName,
        ageGroup
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Erreur lors de l'envoi.");
    }

    showMessage("");
    form.reset();
    showSuccessDialog();
  } catch (error) {
    showMessage(error.message || "Impossible d'envoyer l'inscription.");
  } finally {
    submitButton.disabled = false;
  }
});
