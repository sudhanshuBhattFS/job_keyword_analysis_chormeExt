import { attachMainPopup, attachPopup } from "./ext_popup";
import { MessageBridge } from "./messageBridge";

export async function handleLogin($: Function) {
  const email = $("#email")?.val().trim();
  const password = $("#password")?.val().trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  const response = await MessageBridge.sendToServiceWorker(
    { type: "loginUser", data: { email, password } },
    true
  );

  if (response.status === true) {
    // attachPopup(true);
    attachMainPopup();
  } else {
    // display response message
    alert(response.message || "Login failed. Please try again.");
  }

  console.log("Logging in with:", email, password);

  // Mock auth - replace with real logic
}
