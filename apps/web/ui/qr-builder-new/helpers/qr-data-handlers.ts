import { TQrServerData } from "../types/qr-server-data";
import { EQRType } from "../types/qr-type";

// Function to escape special characters in Wi-Fi QR code
export const escapeWiFiValue = (value: string): string => {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/"/g, '\\"')
    .replace(/:/g, "\\:");
};

// Function to parse escaped values in Wi-Fi QR code
export const unescapeWiFiValue = (value: string): string => {
  return value
    .replace(/\\:/g, ":")
    .replace(/\\"/g, '"')
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
};

// Data encoders - convert form data to QR code data string
export const qrTypeDataEncoders = {
  [EQRType.WEBSITE]: (values: Record<string, any>) => {
    return values.websiteLink || "";
  },

  [EQRType.APP_LINK]: (values: Record<string, any>) => {
    return values.storeLink || "";
  },

  [EQRType.SOCIAL]: (values: Record<string, any>) => {
    return values.socialLink || "";
  },

  [EQRType.FEEDBACK]: (values: Record<string, any>) => {
    return values.link || "";
  },

  [EQRType.WHATSAPP]: (values: Record<string, any>) => {
    const { number, message } = values;
    if (!number) return "";

    // Clean and format the phone number
    const cleanNumber = number.replace(/\D/g, "");
    const formattedNumber = cleanNumber.startsWith("+")
      ? cleanNumber
      : `+${cleanNumber}`;

    return message && message.trim()
      ? `https://wa.me/${formattedNumber}?text=${encodeURIComponent(message.trim())}`
      : `https://wa.me/${formattedNumber}`;
  },

  [EQRType.WIFI]: (values: Record<string, any>) => {
    const {
      networkEncryption = "WPA",
      networkName = "",
      networkPassword = "",
      isHiddenNetwork = false,
    } = values;

    const encryptionType = escapeWiFiValue(networkEncryption);
    const ssid = escapeWiFiValue(networkName);
    const password = escapeWiFiValue(networkPassword);
    const hidden = Boolean(isHiddenNetwork);

    return `WIFI:T:${encryptionType};S:${ssid};P:${password};H:${hidden};`;
  },

  // For file types, construct URL if fileId is provided (for QR rendering)
  // Backend will replace this with proper R2 URL when saving
  [EQRType.PDF]: (_values: Record<string, any>, fileId?: string) => {
    if (fileId) {
      // Construct a valid URL for QR rendering
      return `${process.env.NEXT_PUBLIC_STORAGE_BASE_URL}/qrs-content/${fileId}`;
    }
    return "";
  },

  [EQRType.IMAGE]: (_values: Record<string, any>, fileId?: string) => {
    if (fileId) {
      return `${process.env.NEXT_PUBLIC_STORAGE_BASE_URL}/qrs-content/${fileId}`;
    }
    return "";
  },

  [EQRType.VIDEO]: (_values: Record<string, any>, fileId?: string) => {
    if (fileId) {
      return `${process.env.NEXT_PUBLIC_STORAGE_BASE_URL}/qrs-content/${fileId}`;
    }
    return "";
  },

  [EQRType.VCARD]: (values: Record<string, any>) => {
    const {
      firstName = "",
      lastName = "",
      phone = "",
      mobile = "",
      work = "",
      fax = "",
      company = "",
      role = "",
      website = "",
      email = "",
      street = "",
      city = "",
      state = "",
      zip = "",
      country = "",
    } = values;

    const lines: string[] = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${lastName};${firstName};;;`,
      `FN:${firstName} ${lastName}`,
    ];

    if (company) lines.push(`ORG:${company}`);
    if (role) lines.push(`TITLE:${role}`);
    if (phone) lines.push(`TEL;TYPE=HOME:${phone}`);
    if (mobile) lines.push(`TEL;TYPE=CELL:${mobile}`);
    if (work) lines.push(`TEL;TYPE=WORK:${work}`);
    if (fax) lines.push(`TEL;TYPE=FAX:${fax}`);
    if (email) lines.push(`EMAIL:${email}`);
    if (website) lines.push(`URL:${website}`);

    if (street || city || state || zip || country) {
      lines.push(`ADR:;;${street};${city};${state};${zip};${country}`);
    }

    lines.push("END:VCARD");

    return lines.join("\n");
  },
};

// Data parsers - convert QR code data string back to form values
export const qrTypeDataParsers = {
  [EQRType.WEBSITE]: (data: string): Record<string, any> => {
    return { websiteLink: data };
  },

  [EQRType.APP_LINK]: (data: string): Record<string, any> => {
    return { storeLink: data };
  },

  [EQRType.SOCIAL]: (data: string): Record<string, any> => {
    return { socialLink: data };
  },

  [EQRType.FEEDBACK]: (data: string): Record<string, any> => {
    return { link: data };
  },

  [EQRType.WHATSAPP]: (data: string): Record<string, any> => {
    try {
      const url = new URL(data);
      let number = "";
      let message = "";

      if (url.hostname === "wa.me") {
        number = url.pathname.replace("/", "");
        const textParam = url.searchParams.get("text");
        message =
          textParam && textParam !== "undefined"
            ? decodeURIComponent(textParam)
            : "";
      } else if (
        url.hostname === "whatsapp.com" ||
        url.hostname === "api.whatsapp.com"
      ) {
        number = url.searchParams.get("phone") || "";
        const textParam = url.searchParams.get("text");
        message =
          textParam && textParam !== "undefined"
            ? decodeURIComponent(textParam)
            : "";
      }

      // Clean number formatting
      number = number.replace(/\D/g, "");
      if (number && !number.startsWith("+")) {
        number = `+${number}`;
      }

      return { number, message };
    } catch (e) {
      // Fallback - try to extract number from string
      const numberMatch = data.match(/\d+/);
      if (numberMatch) {
        return {
          number: `+${numberMatch[0]}`,
          message: "",
        };
      }
      return { number: "", message: "" };
    }
  },

  [EQRType.WIFI]: (data: string): Record<string, any> => {
    const wifiMatch = data.match(
      /WIFI:T:([^;]+(?:\\;[^;]+)*);S:([^;]+(?:\\;[^;]+)*);P:([^;]+(?:\\;[^;]+)*);H:([^;]+(?:\\;[^;]+)*);/,
    );

    if (wifiMatch) {
      return {
        networkEncryption: unescapeWiFiValue(wifiMatch[1]),
        networkName: unescapeWiFiValue(wifiMatch[2]),
        networkPassword: unescapeWiFiValue(wifiMatch[3]),
        isHiddenNetwork: wifiMatch[4] === "true",
      };
    }

    return {
      networkEncryption: "WPA",
      networkName: "",
      networkPassword: "",
      isHiddenNetwork: false,
    };
  },

  // For file types, we'll extract any URL or return empty values
  [EQRType.PDF]: (data: string): Record<string, any> => {
    // If data is a URL, it's likely the file URL
    try {
      new URL(data);
      return { fileUrl: data };
    } catch {
      return {};
    }
  },

  [EQRType.IMAGE]: (data: string): Record<string, any> => {
    try {
      new URL(data);
      return { fileUrl: data };
    } catch {
      return {};
    }
  },

  [EQRType.VIDEO]: (data: string): Record<string, any> => {
    try {
      new URL(data);
      return { fileUrl: data };
    } catch {
      return {};
    }
  },

  [EQRType.VCARD]: (data: string): Record<string, any> => {
    const result: Record<string, any> = {
      firstName: "",
      lastName: "",
      phone: "",
      mobile: "",
      work: "",
      fax: "",
      company: "",
      role: "",
      website: "",
      email: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    };

    if (!data.startsWith("BEGIN:VCARD")) {
      return result;
    }

    const lines = data.split(/\r?\n/);

    for (const line of lines) {
      if (line.startsWith("N:")) {
        const parts = line.substring(2).split(";");
        result.lastName = parts[0] || "";
        result.firstName = parts[1] || "";
      } else if (line.startsWith("ORG:")) {
        result.company = line.substring(4);
      } else if (line.startsWith("TITLE:")) {
        result.role = line.substring(6);
      } else if (line.startsWith("TEL;TYPE=HOME:")) {
        result.phone = line.substring(14);
      } else if (line.startsWith("TEL;TYPE=CELL:")) {
        result.mobile = line.substring(14);
      } else if (line.startsWith("TEL;TYPE=WORK:")) {
        result.work = line.substring(14);
      } else if (line.startsWith("TEL;TYPE=FAX:")) {
        result.fax = line.substring(13);
      } else if (line.startsWith("EMAIL:")) {
        result.email = line.substring(6);
      } else if (line.startsWith("URL:")) {
        result.website = line.substring(4);
      } else if (line.startsWith("ADR:")) {
        const parts = line.substring(4).split(";");
        // ADR format: PO Box;Extended;Street;City;State;Zip;Country
        result.street = parts[2] || "";
        result.city = parts[3] || "";
        result.state = parts[4] || "";
        result.zip = parts[5] || "";
        result.country = parts[6] || "";
      }
    }

    return result;
  },
};

// Helper function to encode form data for a specific QR type
export const encodeQRData = (
  qrType: EQRType,
  formData: Record<string, any>,
  fileId?: string,
): string => {
  const encoder = qrTypeDataEncoders[qrType];
  if (!encoder) {
    throw new Error(`No encoder found for QR type: ${qrType}`);
  }

  return encoder(formData, fileId);
};

// Helper function to parse QR data for a specific QR type
export const parseQRData = (
  qrType: EQRType,
  data: string,
): Record<string, any> => {
  const parser = qrTypeDataParsers[qrType];
  if (!parser) {
    throw new Error(`No parser found for QR type: ${qrType}`);
  }

  return parser(data);
};

export const getDisplayContent = (qrCode: TQrServerData): string => {
  const { data, qrType } = qrCode;

  switch (qrType as EQRType) {
    case EQRType.WHATSAPP:
      try {
        const url = new URL(qrCode?.link?.url || "");
        let number = "";

        if (url.hostname === "wa.me") {
          number = url.pathname.replace("/", "");
        } else if (
          url.hostname === "whatsapp.com" ||
          url.hostname === "api.whatsapp.com"
        ) {
          number = url.searchParams.get("phone") || "";
        }

        if (number) {
          return `+${number.replace(/\D/g, "")}`;
        }
      } catch (e) {
        const numberMatch = data.match(/\d+/);
        if (numberMatch) {
          return `+${numberMatch[0]}`;
        }
      }
      return data;

    case EQRType.WIFI:
      const wifiMatch = data.match(
        /WIFI:T:([^;]+(?:\\;[^;]+)*);S:([^;]+(?:\\;[^;]+)*);P:([^;]+(?:\\;[^;]+)*);H:([^;]+(?:\\;[^;]+)*);/,
      );
      if (wifiMatch) {
        return unescapeWiFiValue(wifiMatch[2]); // networkName
      }
      return data;

    case EQRType.PDF:
    case EQRType.IMAGE:
    case EQRType.VIDEO:
      if (qrCode?.file?.name) {
        return qrCode.file.name;
      }

      if (qrCode.link?.url) {
        try {
          const url = new URL(qrCode.link.url);
          const id = url.pathname.split("/").pop();
          return id || qrCode.link.url;
        } catch {
          return qrCode.link.url;
        }
      }

      return data;

    case EQRType.VCARD:
      // Try to extract the full name from vCard data
      const fnMatch = data.match(/FN:(.+)/);
      if (fnMatch) {
        return fnMatch[1];
      }
      return "Business Card";

    case EQRType.WEBSITE:
    case EQRType.APP_LINK:
    case EQRType.SOCIAL:
    case EQRType.FEEDBACK:
    default:
      return qrCode.link?.url || data;
  }
};
