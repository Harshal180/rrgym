// ============================================================
//  GYM BRANDING CONFIG — edit this file to rebrand the app
//  for any gym. All PDFs, emails & SMS read from here.
// ============================================================

const GYM_CONFIG = {
  name:    process.env.GYM_NAME    || "RR POWER AND WELLNESS GYM",
  email:   process.env.GYM_EMAIL   || "gangurderoshan8208@gmail.com",
  phone:   process.env.GYM_PHONE   || "+91 8208728607",
  address: process.env.GYM_ADDRESS || "Kashidara Road, Near Mahadeo Mandir, Sakri - 424304",
};

module.exports = GYM_CONFIG;
