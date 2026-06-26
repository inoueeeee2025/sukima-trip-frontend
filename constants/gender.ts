export type GenderLabel = "男性" | "女性" | "その他";

export const GENDERS: GenderLabel[] = ["男性", "女性", "その他"];

export const GENDER_VALUES: Record<GenderLabel, string> = {
  男性: "male",
  女性: "female",
  その他: "other",
};

export const GENDER_LABELS: Record<string, GenderLabel> = {
  male: "男性",
  female: "女性",
  other: "その他",
};
