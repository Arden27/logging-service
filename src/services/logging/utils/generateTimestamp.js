import moment from 'moment-timezone';

const timezone = "Europe/Warsaw";

export default function generateTimestamp() {
  return moment()
    .tz(timezone)
    .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
}