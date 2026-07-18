import mongoose from "mongoose";

const ticketCounterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    sequence: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "ticket_counters",
  },
);

const TicketCounter = mongoose.model("TicketCounter", ticketCounterSchema);

export default TicketCounter;
