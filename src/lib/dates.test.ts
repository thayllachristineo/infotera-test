import { describe, expect, it } from "vitest";
import {
  addDays,
  nightsBetween,
  parseISODate,
  stayDateIssues,
} from "@/lib/dates";

const TODAY = "2026-11-16";

describe("datas da estadia", () => {
  it("rejeita dia inexistente", () => {
    expect(parseISODate("2026-02-31")).toBeNull();
  });

  it("conta noites em calendário local", () => {
    expect(nightsBetween("2026-12-01", "2026-12-04")).toBe(3);
    expect(addDays("2026-12-01", 30)).toBe("2026-12-31");
  });

  it("exige check-in a partir de hoje e no máximo 30 noites", () => {
    expect(
      stayDateIssues({ checkIn: "2026-11-15", checkOut: "2026-11-20" }, TODAY),
    ).toEqual([
      { path: "checkIn", message: "Check-in não pode ser no passado" },
    ]);

    expect(
      stayDateIssues({ checkIn: "2026-12-01", checkOut: "2026-12-01" }, TODAY),
    ).toEqual([
      {
        path: "checkOut",
        message: "Check-out deve ser pelo menos 1 dia após o check-in",
      },
    ]);

    const tooLong = stayDateIssues(
      { checkIn: "2026-12-01", checkOut: addDays("2026-12-01", 31) },
      TODAY,
    );
    expect(tooLong[0]?.message).toBe("A estadia máxima é de 30 noites");

    expect(
      stayDateIssues(
        { checkIn: "2026-12-01", checkOut: addDays("2026-12-01", 30) },
        TODAY,
      ),
    ).toEqual([]);
  });
});
