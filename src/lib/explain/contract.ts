import { z } from "zod";
import { INTEREST_TAGS, PRIORITY_KEYS, SKILL_KEYS } from "@/engine";

/**
 * What the explain endpoint accepts. Everything is an enum, a bounded number or a
 * short code: there is no free-text field a user could put an instruction in.
 */

const COUNTRY_CODES = ["NO", "SE", "DK", "DE", "NL", "UK", "US"] as const;

const skillsShape = Object.fromEntries(
  SKILL_KEYS.map((key) => [key, z.number().int().min(1).max(5)]),
) as Record<(typeof SKILL_KEYS)[number], z.ZodNumber>;

const prioritiesShape = Object.fromEntries(
  PRIORITY_KEYS.map((key) => [key, z.number().min(0).max(100).optional()]),
) as Record<(typeof PRIORITY_KEYS)[number], z.ZodOptional<z.ZodNumber>>;

const profileSchema = z
  .object({
    interests: z.array(z.enum(INTEREST_TAGS)).max(INTEREST_TAGS.length),
    skills: z.object(skillsShape).strict(),
    priorities: z.object(prioritiesShape).strict(),
    constraints: z
      .object({
        willingToMove: z.enum(["stay", "nearby", "anywhere"]),
        timeHorizonYears: z.number().min(1).max(30),
        currentCountry: z.enum(COUNTRY_CODES),
      })
      .strict(),
  })
  .strict();

const preferenceSchema = z
  .object({
    incomeFocus: z.number().min(0).max(1),
    stayLocal: z.number().min(0).max(1),
    shortEducation: z.number().min(0).max(1),
    remoteFriendly: z.number().min(0).max(1).default(0),
  })
  .strict();

export const explainRequestSchema = z
  .object({
    /** Premium access code; the server checks it on every request. */
    code: z.string().min(1).max(200),
    /** ISCO code of the career to explain. */
    isco: z.string().regex(/^\d{4}$/),
    profile: profileSchema,
    prefs: preferenceSchema,
  })
  .strict();

export type ExplainRequest = z.infer<typeof explainRequestSchema>;
