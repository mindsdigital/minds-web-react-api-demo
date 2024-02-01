export enum MatchResults {
  match = "match",
  different = "different"
}

export enum Reasons {
  voiceMatch = "voice_match",
  voiceDifferent = "voice_different",
  confidenceLow = "confidence_low",
  voiceMatchConfidenceLow = "voice_match_confidence_low",
  phoneFlag = "phone_flag",
  voiceFlag = "voice_flag",
  errorAntiFraud = "error_anti_fraud",
  spoof = "spoof",
  errorAntispoofing = "error_antispoofing",
  enrollmentSuccess = "enrollment_success",
  silencedPhoneFlag = "silenced_phone_flag",
  silencedVoiceFlag = "silenced_voice_flag",
  suspiciousBehaviourFlag = "suspicious_behaviour_flag",
  quarantinePhoneFlag = "quarantine_phone_flag",
  quarantineVoiceFlag = "quarantine_voice_flag",
  sentenceMismatch = "sentence_mismatch",
  errorSentenceMatch = "error_sentence_match",
  silencedSuspiciousBehaviourFlag = "silenced_suspicious_behaviour_flag"
}

export interface VoiceError {
  code?: string;
  description?: string;
}

export interface FlagResult {
  type: string;
  status: string;
}

export interface VoiceResult {
  recommendedAction: "accept" | "reject";
  reasons: Reasons[];
}

export interface VoiceMatchResult {
  result: MatchResults;
  confidence: string;
  status: string;
}

export interface AntiSpoofingResult {
  result: "spoof" | "live";
  status: string;
}

export interface EnrollmentResponse {
  success: boolean;
  error?: VoiceError;
  cpf: string;
  externalId: string;
  createdAt: string;
  result?: VoiceResult;
  details?: EnrollmentDetails;
}

export interface EnrollmentDetails {
  flag?: FlagResult;
  antispoofing?: AntiSpoofingResult;
}

export interface AuthenticationResponse {
  success: boolean;
  error?: VoiceError;
  id: number;
  cpf: string;
  externalId: string;
  createdAt: string;
  result?: VoiceResult;
  details?: AuthenticationDetails;
}

export interface AuthenticationDetails {
  flag?: FlagResult;
  voiceMatch?: VoiceMatchResult;
  antispoofing?: AntiSpoofingResult;
}

export type ValidationType = "success" | "error" | "warning" | "different";

export function validateBiometricsResponse(
  success: boolean,
  data?: EnrollmentResponse | AuthenticationResponse
) {
  const isSpoof = data?.details?.antispoofing?.result === "spoof";
  const isBLocklist = ["blocklist", "blacklist"].some(x =>
    data?.details?.flag?.type.includes(x)
  );
  const code = data?.error?.code;

  const message = getMessage(isSpoof, isBLocklist, success, code, data);

  let type: ValidationType = isSpoof || isBLocklist ? "error" : "warning";

  if (!message) {
    type = "success";
  }

  return [type, message] as const;
}

function getMessage(
  isSpoof: boolean,
  isBlocklist: boolean,
  success: boolean,
  code?: string,
  data?: EnrollmentResponse | AuthenticationResponse
) {
  if (isSpoof) {
    return "spoof";
  }
  if (isBlocklist) {
    return "blocklist";
  }
  if (code === "audio_too_large") {
    return "audio_too_large";
  }
  if (code === "audio_already_used") {
    return "audio_already_used";
  }
  if (code || !success || !data || !data.success) {
    return "generic_error";
  }
}
