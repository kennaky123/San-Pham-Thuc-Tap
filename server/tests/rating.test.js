import assert from "node:assert/strict";
import test from "node:test";
import mongoose from "mongoose";
import Rating from "../src/models/Rating.js";

function createValidRating(overrides = {}) {
  return new Rating({
    ticket: new mongoose.Types.ObjectId(),
    ratedBy: new mongoose.Types.ObjectId(),
    technician: new mongoose.Types.ObjectId(),
    score: 5,
    feedback: "Technician hỗ trợ nhanh và xử lý đúng yêu cầu.",
    ...overrides,
  });
}

test("Rating chấp nhận điểm nguyên từ 1 đến 5", async () => {
  for (const score of [1, 2, 3, 4, 5]) {
    const rating = createValidRating({ score });
    await assert.doesNotReject(rating.validate());
  }
});

test("Rating từ chối điểm ngoài khoảng hoặc số thập phân", async () => {
  for (const score of [0, 2.5, 6]) {
    const rating = createValidRating({ score });

    await assert.rejects(
      rating.validate(),
      (error) => Boolean(error.errors?.score),
    );
  }
});

test("Rating giới hạn nội dung phản hồi tối đa 1000 ký tự", async () => {
  const rating = createValidRating({ feedback: "a".repeat(1001) });

  await assert.rejects(
    rating.validate(),
    (error) => Boolean(error.errors?.feedback),
  );
});
