import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const encoder = new TextEncoder();

function jsonResponse(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function percentEncode(value: string) {
    return encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
        `%${character.charCodeAt(0).toString(16).toUpperCase()}`
    );
}

async function signAliyunQuery(
    accessKeySecret: string,
    params: Record<string, string>,
) {
    const canonicalQuery = Object.keys(params)
        .sort()
        .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
        .join("&");
    const stringToSign = `POST&%2F&${percentEncode(canonicalQuery)}`;
    const signingKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(`${accessKeySecret}&`),
        { name: "HMAC", hash: "SHA-1" },
        false,
        ["sign"],
    );
    const signature = await crypto.subtle.sign(
        "HMAC",
        signingKey,
        encoder.encode(stringToSign),
    );
    const bytes = new Uint8Array(signature);
    const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return btoa(binary);
}

Deno.serve(async (request) => {
    if (request.method !== "POST") {
        return jsonResponse({ error: { message: "Method not allowed" } }, 405);
    }

    const hookSecret = Deno.env.get("SEND_SMS_HOOK_SECRET");
    const accessKeyId = Deno.env.get("ALIBABA_CLOUD_ACCESS_KEY_ID");
    const accessKeySecret = Deno.env.get("ALIBABA_CLOUD_ACCESS_KEY_SECRET");
    const signName = Deno.env.get("ALIYUN_SMS_SIGN_NAME");
    const templateCode = Deno.env.get("ALIYUN_SMS_TEMPLATE_CODE");
    if (!hookSecret || !accessKeyId || !accessKeySecret || !signName || !templateCode) {
        return jsonResponse({ error: { message: "SMS service is not configured" } }, 500);
    }

    const payload = await request.text();
    let event: {
        user?: { phone?: string };
        sms?: { otp?: string };
    };
    try {
        const secret = hookSecret.replace(/^v1,whsec_/, "");
        const webhook = new Webhook(secret);
        event = webhook.verify(payload, Object.fromEntries(request.headers)) as typeof event;
    } catch {
        return jsonResponse({ error: { message: "Invalid SMS hook signature" } }, 401);
    }

    const phone = event.user?.phone;
    const otp = event.sms?.otp;
    if (!phone || !/^\+861[3-9]\d{9}$/.test(phone) || !otp || !/^\d{6}$/.test(otp)) {
        return jsonResponse({ error: { message: "Invalid SMS hook payload" } }, 400);
    }

    const params: Record<string, string> = {
        AccessKeyId: accessKeyId,
        Action: "SendSms",
        Format: "JSON",
        PhoneNumbers: phone.slice(3),
        RegionId: "cn-hangzhou",
        SignName: signName,
        SignatureMethod: "HMAC-SHA1",
        SignatureNonce: crypto.randomUUID(),
        SignatureVersion: "1.0",
        TemplateCode: templateCode,
        TemplateParam: JSON.stringify({ code: otp }),
        Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
        Version: "2017-05-25",
    };
    const signature = await signAliyunQuery(accessKeySecret, params);
    const body = new URLSearchParams({ ...params, Signature: signature });
    let response: Response;
    try {
        response = await fetch("https://dysmsapi.aliyuncs.com/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });
    } catch {
        return jsonResponse({ error: { message: "Unable to reach Aliyun SMS service" } }, 502);
    }

    let result: { Code?: string };
    try {
        result = await response.json();
    } catch {
        return jsonResponse({ error: { message: "Invalid response from Aliyun SMS service" } }, 502);
    }
    if (!response.ok || result.Code !== "OK") {
        return jsonResponse({ error: { message: "Aliyun SMS delivery failed" } }, 502);
    }

    return jsonResponse({});
});
