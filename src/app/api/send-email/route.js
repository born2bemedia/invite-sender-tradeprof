import { NextResponse } from "next/server";
import { ServerClient } from "postmark";

function getApiKeyBySender(sender) {
  const parts = sender.split("@");
  if (parts.length !== 2) return null;
  const domain = parts[1];
  const domainKey = domain.split(".")[0].toUpperCase().replace(/-/g, "_");
  const envVarName = `POSTMARK_API_TOKEN_${domainKey}`;
  return process.env[envVarName];
}

function getMessageStreamBySender(sender) {
  const parts = sender.split("@");
  if (parts.length !== 2) return null;
  const domain = parts[1];
  const domainKey = domain.split(".")[0].toUpperCase().replace(/-/g, "_");
  const envVarName = `POSTMARK_MESSAGE_STREAM_${domainKey}`;
  return process.env[envVarName];
}

export async function POST(request) {
  try {
    const { sender, email, bcc } = await request.json();
    console.log("sender", sender);
    console.log("email", email);
    console.log("bcc", bcc);
    if (!sender) {
      return NextResponse.json(
        { message: "Sender email is required." },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json(
        { message: "Recipient email is required." },
        { status: 400 }
      );
    }

    const apiKey = getApiKeyBySender(sender);
    const messageStream = getMessageStreamBySender(sender);

    if (!apiKey) {
      return NextResponse.json(
        {
          message:
            "Sender is not authorized or no API key configured for this sender.",
        },
        { status: 400 }
      );
    }

    // Initialize Postmark client using the named export.
    const client = new ServerClient(apiKey);

    const emailOptions = {
      From: sender,
      To: email,
      Subject: "Invite",
      HtmlBody: "<p>Invite Sent</p>",
    };

    if (bcc && Array.isArray(bcc) && bcc.length > 0) {
      emailOptions.Bcc = bcc.join(", ");
    }

    if (messageStream) {
      emailOptions.MessageStream = messageStream;
    }

    console.log("emailOptions", emailOptions);

    const result = await client.sendEmail(emailOptions);

    console.log("Email sent successfully from:", sender, "to:", email);
    return NextResponse.json({ message: "Success: email was sent.", result });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "COULD NOT SEND MESSAGE", error: error.message },
      { status: 500 }
    );
  }
}
