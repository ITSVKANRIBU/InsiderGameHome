import {
  buildVillagePayload,
  clampParticipantCount,
  participantLabel,
} from "./form-logic";

describe("form logic characterization", () => {
  it("keeps the village creation payload shape and values", () => {
    expect(buildVillagePayload(["お題A", "お題B"])).toEqual({
      message: ["お題A", "お題B"],
    });
  });

  it("clamps the participant count to the existing 2-20 range", () => {
    expect(clampParticipantCount(1)).toBe(2);
    expect(clampParticipantCount(2)).toBe(2);
    expect(clampParticipantCount(5)).toBe(5);
    expect(clampParticipantCount(20)).toBe(20);
    expect(clampParticipantCount(21)).toBe(20);
  });

  it("uses the existing participant label format", () => {
    expect(participantLabel(1)).toBe("参加者1");
    expect(participantLabel(6)).toBe("参加者6");
  });
});
