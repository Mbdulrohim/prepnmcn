/**
 * Seed Nigerian nursing & medical institutions.
 *
 * Safe to run multiple times — skips institutions that already exist (matched by name).
 *
 * Usage:
 *   npx tsx scripts/seed-institutions.ts
 *   npx tsx scripts/seed-institutions.ts --dry-run    # preview only
 */

import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env

import { Institution } from "../src/entities/Institution";

// ── CLI args ────────────────────────────────────────────────────────────────
const DRY_RUN = process.argv.includes("--dry-run");

// ── Institution data ─────────────────────────────────────────────────────────
// Fields: name, code, state, city, type
const INSTITUTIONS = [
  // ── Federal Universities ────────────────────────────────────────────────────
  { name: "UNIVERSITY OF LAGOS", code: "UNILAG", state: "Lagos", city: "Lagos", type: "University" },
  { name: "UNIVERSITY OF IBADAN", code: "UI", state: "Oyo", city: "Ibadan", type: "University" },
  { name: "UNIVERSITY OF NIGERIA NSUKKA", code: "UNN", state: "Enugu", city: "Nsukka", type: "University" },
  { name: "AHMADU BELLO UNIVERSITY", code: "ABU", state: "Kaduna", city: "Zaria", type: "University" },
  { name: "UNIVERSITY OF BENIN", code: "UNIBEN", state: "Edo", city: "Benin City", type: "University" },
  { name: "OBAFEMI AWOLOWO UNIVERSITY", code: "OAU", state: "Osun", city: "Ile-Ife", type: "University" },
  { name: "UNIVERSITY OF PORT HARCOURT", code: "UNIPORT", state: "Rivers", city: "Port Harcourt", type: "University" },
  { name: "UNIVERSITY OF CALABAR", code: "UNICAL", state: "Cross River", city: "Calabar", type: "University" },
  { name: "UNIVERSITY OF ILORIN", code: "UNILORIN", state: "Kwara", city: "Ilorin", type: "University" },
  { name: "BAYERO UNIVERSITY KANO", code: "BUK", state: "Kano", city: "Kano", type: "University" },
  { name: "UNIVERSITY OF MAIDUGURI", code: "UNIMAID", state: "Borno", city: "Maiduguri", type: "University" },
  { name: "UNIVERSITY OF JOS", code: "UNIJOS", state: "Plateau", city: "Jos", type: "University" },
  { name: "FEDERAL UNIVERSITY OF TECHNOLOGY OWERRI", code: "FUTO", state: "Imo", city: "Owerri", type: "University" },
  { name: "NNAMDI AZIKIWE UNIVERSITY", code: "UNIZIK", state: "Anambra", city: "Awka", type: "University" },
  { name: "DELTA STATE UNIVERSITY", code: "DELSU", state: "Delta", city: "Abraka", type: "University" },
  { name: "AMBROSE ALLI UNIVERSITY", code: "AAU", state: "Edo", city: "Ekpoma", type: "University" },
  { name: "EBONYI STATE UNIVERSITY", code: "EBSU", state: "Ebonyi", city: "Abakaliki", type: "University" },
  { name: "IMO STATE UNIVERSITY", code: "IMSU", state: "Imo", city: "Owerri", type: "University" },
  { name: "ABIA STATE UNIVERSITY", code: "ABSU", state: "Abia", city: "Uturu", type: "University" },
  { name: "ANAMBRA STATE UNIVERSITY", code: "ANSU", state: "Anambra", city: "Awka", type: "University" },
  { name: "RIVERS STATE UNIVERSITY", code: "RSU", state: "Rivers", city: "Port Harcourt", type: "University" },
  { name: "ENUGU STATE UNIVERSITY OF SCIENCE AND TECHNOLOGY", code: "ESUT", state: "Enugu", city: "Enugu", type: "University" },
  { name: "CROSS RIVER UNIVERSITY OF TECHNOLOGY", code: "CRUTECH", state: "Cross River", city: "Calabar", type: "University" },
  { name: "KOGI STATE UNIVERSITY", code: "KSU", state: "Kogi", city: "Anyigba", type: "University" },
  { name: "BENUE STATE UNIVERSITY", code: "BSU", state: "Benue", city: "Makurdi", type: "University" },
  { name: "NASARAWA STATE UNIVERSITY", code: "NSUK", state: "Nasarawa", city: "Keffi", type: "University" },
  { name: "NIGER DELTA UNIVERSITY", code: "NDU", state: "Bayelsa", city: "Wilberforce Island", type: "University" },
  { name: "USMAN DAN FODIO UNIVERSITY", code: "UDUS", state: "Sokoto", city: "Sokoto", type: "University" },
  { name: "GOMBE STATE UNIVERSITY", code: "GSU", state: "Gombe", city: "Gombe", type: "University" },
  { name: "FEDERAL UNIVERSITY DUTSE", code: "FUD", state: "Jigawa", city: "Dutse", type: "University" },
  { name: "FEDERAL UNIVERSITY LAFIA", code: "FULAFIA", state: "Nasarawa", city: "Lafia", type: "University" },
  { name: "FEDERAL UNIVERSITY LOKOJA", code: "FULOKOJA", state: "Kogi", city: "Lokoja", type: "University" },
  { name: "FEDERAL UNIVERSITY OYE-EKITI", code: "FUOYE", state: "Ekiti", city: "Oye-Ekiti", type: "University" },
  { name: "EKITI STATE UNIVERSITY", code: "EKSU", state: "Ekiti", city: "Ado-Ekiti", type: "University" },
  { name: "ONDO STATE UNIVERSITY OF SCIENCE AND TECHNOLOGY", code: "OSUSTECH", state: "Ondo", city: "Okitipupa", type: "University" },
  { name: "LAGOS STATE UNIVERSITY", code: "LASU", state: "Lagos", city: "Ojo", type: "University" },
  { name: "OLABISI ONABANJO UNIVERSITY", code: "OOU", state: "Ogun", city: "Ago-Iwoye", type: "University" },
  { name: "OGUN STATE UNIVERSITY", code: "OGUNSTATE", state: "Ogun", city: "Abeokuta", type: "University" },
  { name: "OSUN STATE UNIVERSITY", code: "UNIOSUN", state: "Osun", city: "Osogbo", type: "University" },
  { name: "KWARA STATE UNIVERSITY", code: "KWASU", state: "Kwara", city: "Malete", type: "University" },

  // ── Colleges of Nursing ──────────────────────────────────────────────────────
  { name: "COLLEGE OF NURSING SCIENCES LAGOS", code: "CNSL", state: "Lagos", city: "Lagos", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES IBADAN", code: "CNSI", state: "Oyo", city: "Ibadan", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES ABUJA", code: "CNSA", state: "FCT", city: "Abuja", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES KANO", code: "CNSK", state: "Kano", city: "Kano", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES ENUGU", code: "CNSE", state: "Enugu", city: "Enugu", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES PORT HARCOURT", code: "CNSPH", state: "Rivers", city: "Port Harcourt", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES MAIDUGURI", code: "CNSM", state: "Borno", city: "Maiduguri", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES KADUNA", code: "CNSKD", state: "Kaduna", city: "Kaduna", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES CALABAR", code: "CNSC", state: "Cross River", city: "Calabar", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES SAGAMU", code: "CNSS", state: "Ogun", city: "Sagamu", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES IRRUA", code: "CNSIR", state: "Edo", city: "Irrua", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES ABEOKUTA", code: "CNSAB", state: "Ogun", city: "Abeokuta", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES AKURE", code: "CNSAK", state: "Ondo", city: "Akure", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES OWERRI", code: "CNSOW", state: "Imo", city: "Owerri", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES BENIN CITY", code: "CNSBC", state: "Edo", city: "Benin City", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES JOS", code: "CNSJ", state: "Plateau", city: "Jos", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES SOKOTO", code: "CNSO", state: "Sokoto", city: "Sokoto", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES ABAKALIKI", code: "CNSABA", state: "Ebonyi", city: "Abakaliki", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES MAKURDI", code: "CNSMK", state: "Benue", city: "Makurdi", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES WARRI", code: "CNSW", state: "Delta", city: "Warri", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES OSOGBO", code: "CNSOS", state: "Osun", city: "Osogbo", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES ILORIN", code: "CNSIL", state: "Kwara", city: "Ilorin", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING AND MIDWIFERY ABEOKUTA", code: "CNMA", state: "Ogun", city: "Abeokuta", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING UNIVERSITY COLLEGE HOSPITAL IBADAN", code: "SNUCHI", state: "Oyo", city: "Ibadan", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING LAGOS UNIVERSITY TEACHING HOSPITAL", code: "SNLUTH", state: "Lagos", city: "Lagos", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING OBAFEMI AWOLOWO UNIVERSITY TEACHING HOSPITALS COMPLEX", code: "SNOAUTH", state: "Osun", city: "Ile-Ife", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING UNIVERSITY OF BENIN TEACHING HOSPITAL", code: "SNUBTH", state: "Edo", city: "Benin City", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING AMINU KANO TEACHING HOSPITAL", code: "SNAKTH", state: "Kano", city: "Kano", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING AHMADU BELLO UNIVERSITY TEACHING HOSPITAL", code: "SNABUTH", state: "Kaduna", city: "Zaria", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING UNIVERSITY OF NIGERIA TEACHING HOSPITAL ENUGU", code: "SNUNTH", state: "Enugu", city: "Enugu", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING UNIVERSITY OF PORT HARCOURT TEACHING HOSPITAL", code: "SNUPTH", state: "Rivers", city: "Port Harcourt", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING UNIVERSITY OF CALABAR TEACHING HOSPITAL", code: "SNUCTH", state: "Cross River", city: "Calabar", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING NNAMDI AZIKIWE UNIVERSITY TEACHING HOSPITAL", code: "SNNAUTH", state: "Anambra", city: "Nnewi", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE OWERRI", code: "SNFMCO", state: "Imo", city: "Owerri", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE ABEOKUTA", code: "SNFMCAB", state: "Ogun", city: "Abeokuta", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE BIRNIN KEBBI", code: "SNFMCBK", state: "Kebbi", city: "Birnin Kebbi", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING NATIONAL HOSPITAL ABUJA", code: "SNNHA", state: "FCT", city: "Abuja", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE BIDA", code: "SNFMCBD", state: "Niger", city: "Bida", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE AZARE", code: "SNFMCAZ", state: "Bauchi", city: "Azare", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE YOLA", code: "SNFMCYL", state: "Adamawa", city: "Yola", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE JALINGO", code: "SNFMCJL", state: "Taraba", city: "Jalingo", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE KEFFI", code: "SNFMCKF", state: "Nasarawa", city: "Keffi", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE LOKOJA", code: "SNFMCLK", state: "Kogi", city: "Lokoja", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE UMUAHIA", code: "SNFMCUM", state: "Abia", city: "Umuahia", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE ASABA", code: "SNFMCAS", state: "Delta", city: "Asaba", type: "College of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE ONDO", code: "SNFMCON", state: "Ondo", city: "Ondo", type: "College of Nursing" },

  // ── Colleges of Health Technology ───────────────────────────────────────────
  { name: "COLLEGE OF HEALTH TECHNOLOGY MAIDUGURI", code: "CHTM", state: "Borno", city: "Maiduguri", type: "College of Health Technology" },
  { name: "COLLEGE OF HEALTH TECHNOLOGY CALABAR", code: "CHTC", state: "Cross River", city: "Calabar", type: "College of Health Technology" },
  { name: "COLLEGE OF HEALTH SCIENCES ABUJA", code: "CHSA", state: "FCT", city: "Abuja", type: "College of Health Technology" },
  { name: "COLLEGE OF HEALTH SCIENCES ILORIN", code: "CHSIL", state: "Kwara", city: "Ilorin", type: "College of Health Technology" },
  { name: "COLLEGE OF HEALTH SCIENCES LAGOS", code: "CHSL", state: "Lagos", city: "Lagos", type: "College of Health Technology" },

  // ── Schools of Midwifery ─────────────────────────────────────────────────────
  { name: "SCHOOL OF MIDWIFERY LAGOS", code: "SML", state: "Lagos", city: "Lagos", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY IBADAN", code: "SMI", state: "Oyo", city: "Ibadan", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY ENUGU", code: "SME", state: "Enugu", city: "Enugu", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY PORT HARCOURT", code: "SMPH", state: "Rivers", city: "Port Harcourt", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY KANO", code: "SMK", state: "Kano", city: "Kano", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY BENIN CITY", code: "SMBC", state: "Edo", city: "Benin City", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY KADUNA", code: "SMKD", state: "Kaduna", city: "Kaduna", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY CALABAR", code: "SMC", state: "Cross River", city: "Calabar", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY ABAKALIKI", code: "SMABA", state: "Ebonyi", city: "Abakaliki", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY MAKURDI", code: "SMMK", state: "Benue", city: "Makurdi", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY JOS", code: "SMJ", state: "Plateau", city: "Jos", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY OWERRI", code: "SMOW", state: "Imo", city: "Owerri", type: "School of Midwifery" },

  // ── More Federal Universities ────────────────────────────────────────────────
  { name: "FEDERAL UNIVERSITY OF TECHNOLOGY AKURE", code: "FUTA", state: "Ondo", city: "Akure", type: "University" },
  { name: "FEDERAL UNIVERSITY OF TECHNOLOGY MINNA", code: "FUTMINNA", state: "Niger", city: "Minna", type: "University" },
  { name: "FEDERAL UNIVERSITY WUKARI", code: "FUWUKARI", state: "Taraba", city: "Wukari", type: "University" },
  { name: "FEDERAL UNIVERSITY KASHERE", code: "FUKASHERE", state: "Gombe", city: "Kashere", type: "University" },
  { name: "FEDERAL UNIVERSITY BIRNIN KEBBI", code: "FUBK", state: "Kebbi", city: "Birnin Kebbi", type: "University" },
  { name: "FEDERAL UNIVERSITY DUTSIN-MA", code: "FUDMA", state: "Katsina", city: "Dutsin-Ma", type: "University" },
  { name: "FEDERAL UNIVERSITY GASHUA", code: "FUGASHUA", state: "Yobe", city: "Gashua", type: "University" },
  { name: "FEDERAL UNIVERSITY GUSAU", code: "FUGUSAU", state: "Zamfara", city: "Gusau", type: "University" },
  { name: "FEDERAL UNIVERSITY NDUFU-ALIKE IKWO", code: "FUNAI", state: "Ebonyi", city: "Ndufu-Alike", type: "University" },
  { name: "FEDERAL UNIVERSITY OF AGRICULTURE ABEOKUTA", code: "FUNAAB", state: "Ogun", city: "Abeokuta", type: "University" },
  { name: "FEDERAL UNIVERSITY OF AGRICULTURE MAKURDI", code: "FUAM", state: "Benue", city: "Makurdi", type: "University" },
  { name: "FEDERAL UNIVERSITY OF PETROLEUM RESOURCES EFFURUN", code: "FUPRE", state: "Delta", city: "Effurun", type: "University" },
  { name: "MICHAEL OKPARA UNIVERSITY OF AGRICULTURE UMUDIKE", code: "MOUAU", state: "Abia", city: "Umudike", type: "University" },
  { name: "MODIBBO ADAMA UNIVERSITY OF TECHNOLOGY", code: "MAUTECH", state: "Adamawa", city: "Yola", type: "University" },
  { name: "UNIVERSITY OF ABUJA", code: "UNIABUJA", state: "FCT", city: "Abuja", type: "University" },
  { name: "FEDERAL UNIVERSITY OTUOKE", code: "FUOTUOKE", state: "Bayelsa", city: "Otuoke", type: "University" },

  // ── More State Universities ───────────────────────────────────────────────────
  { name: "AKWA IBOM STATE UNIVERSITY", code: "AKSU", state: "Akwa Ibom", city: "Ikot Akpaden", type: "University" },
  { name: "UNIVERSITY OF UYO", code: "UNIUYO", state: "Akwa Ibom", city: "Uyo", type: "University" },
  { name: "IGNATIUS AJURU UNIVERSITY OF EDUCATION", code: "IAUE", state: "Rivers", city: "Port Harcourt", type: "University" },
  { name: "PLATEAU STATE UNIVERSITY", code: "PLASU", state: "Plateau", city: "Bokkos", type: "University" },
  { name: "KADUNA STATE UNIVERSITY", code: "KASU", state: "Kaduna", city: "Kaduna", type: "University" },
  { name: "KANO UNIVERSITY OF SCIENCE AND TECHNOLOGY", code: "KUST", state: "Kano", city: "Wudil", type: "University" },
  { name: "NORTHWEST UNIVERSITY KANO", code: "NWU", state: "Kano", city: "Kano", type: "University" },
  { name: "SOKOTO STATE UNIVERSITY", code: "SSU", state: "Sokoto", city: "Sokoto", type: "University" },
  { name: "KEBBI STATE UNIVERSITY OF SCIENCE AND TECHNOLOGY", code: "KSUSTA", state: "Kebbi", city: "Aliero", type: "University" },
  { name: "ZAMFARA STATE UNIVERSITY", code: "ZSU", state: "Zamfara", city: "Talata Mafara", type: "University" },
  { name: "YOBE STATE UNIVERSITY", code: "YSU", state: "Yobe", city: "Damaturu", type: "University" },
  { name: "ADAMAWA STATE UNIVERSITY", code: "ADSU", state: "Adamawa", city: "Mubi", type: "University" },
  { name: "TARABA STATE UNIVERSITY", code: "TSU", state: "Taraba", city: "Jalingo", type: "University" },
  { name: "ADEKUNLE AJASIN UNIVERSITY", code: "AAUA", state: "Ondo", city: "Akungba-Akoko", type: "University" },

  // ── Private Universities ──────────────────────────────────────────────────────
  { name: "BABCOCK UNIVERSITY", code: "BABCOCK", state: "Ogun", city: "Ilishan-Remo", type: "University" },
  { name: "COVENANT UNIVERSITY", code: "CU", state: "Ogun", city: "Ota", type: "University" },
  { name: "MADONNA UNIVERSITY", code: "MADONNA", state: "Anambra", city: "Elele", type: "University" },
  { name: "BINGHAM UNIVERSITY", code: "BINGHAM", state: "Nasarawa", city: "Karu", type: "University" },
  { name: "BOWEN UNIVERSITY", code: "BOWEN", state: "Osun", city: "Iwo", type: "University" },
  { name: "IGBINEDION UNIVERSITY OKADA", code: "IUO", state: "Edo", city: "Okada", type: "University" },
  { name: "LEAD CITY UNIVERSITY", code: "LCU", state: "Oyo", city: "Ibadan", type: "University" },
  { name: "CARITAS UNIVERSITY", code: "CARITAS", state: "Enugu", city: "Amorji-Nike", type: "University" },
  { name: "GODFREY OKOYE UNIVERSITY", code: "GOUNI", state: "Enugu", city: "Ugwuomu-Nike", type: "University" },
  { name: "RHEMA UNIVERSITY", code: "RHEMA", state: "Abia", city: "Aba", type: "University" },
  { name: "VERITAS UNIVERSITY", code: "VERITAS", state: "FCT", city: "Abuja", type: "University" },
  { name: "NILE UNIVERSITY OF NIGERIA", code: "NILEUNIV", state: "FCT", city: "Abuja", type: "University" },
  { name: "AMERICAN UNIVERSITY OF NIGERIA", code: "AUN", state: "Adamawa", city: "Yola", type: "University" },
  { name: "AFE BABALOLA UNIVERSITY", code: "ABUAD", state: "Ekiti", city: "Ado-Ekiti", type: "University" },
  { name: "LANDMARK UNIVERSITY", code: "LMU", state: "Kwara", city: "Omu-Aran", type: "University" },
  { name: "AL-HIKMAH UNIVERSITY", code: "ALHIKMAH", state: "Kwara", city: "Ilorin", type: "University" },
  { name: "FOUNTAIN UNIVERSITY", code: "FUO", state: "Osun", city: "Osogbo", type: "University" },
  { name: "JOSEPH AYO BABALOLA UNIVERSITY", code: "JABU", state: "Osun", city: "Ikeji-Arakeji", type: "University" },
  { name: "BENSON IDAHOSA UNIVERSITY", code: "BIU", state: "Edo", city: "Benin City", type: "University" },
  { name: "WESTERN DELTA UNIVERSITY", code: "WDU", state: "Delta", city: "Oghara", type: "University" },
  { name: "TANSIAN UNIVERSITY", code: "TANSIAN", state: "Anambra", city: "Umunya", type: "University" },
  { name: "PAN-ATLANTIC UNIVERSITY", code: "PAU", state: "Lagos", city: "Lagos", type: "University" },
  { name: "CHRISLAND UNIVERSITY", code: "CHRISLAND", state: "Ogun", city: "Abeokuta", type: "University" },
  { name: "BELLS UNIVERSITY OF TECHNOLOGY", code: "BUT", state: "Ogun", city: "Ota", type: "University" },
  { name: "ACHIEVERS UNIVERSITY", code: "AUW", state: "Ondo", city: "Owo", type: "University" },
  { name: "ELIZADE UNIVERSITY", code: "EU", state: "Ondo", city: "Ilara-Mokin", type: "University" },
  { name: "WELLSPRING UNIVERSITY", code: "WELLSPRING", state: "Edo", city: "Benin City", type: "University" },
  { name: "PAUL UNIVERSITY", code: "PAULUNIV", state: "Anambra", city: "Awka", type: "University" },
  { name: "HEZEKIAH UNIVERSITY", code: "HEZUNIV", state: "Imo", city: "Umudi", type: "University" },
  { name: "CLIFFORD UNIVERSITY", code: "CLIFFORD", state: "Abia", city: "Owerrinta", type: "University" },
  { name: "NOVENA UNIVERSITY", code: "NOVENA", state: "Delta", city: "Ogume", type: "University" },
  { name: "SAMUEL ADEGBOYEGA UNIVERSITY", code: "SAU", state: "Edo", city: "Ogwa", type: "University" },
  { name: "REDEEMER'S UNIVERSITY", code: "RUN", state: "Osun", city: "Ede", type: "University" },
  { name: "ANCHOR UNIVERSITY", code: "AUALC", state: "Lagos", city: "Lagos", type: "University" },
  { name: "TRINITY UNIVERSITY", code: "TRINITYU", state: "Lagos", city: "Lagos", type: "University" },
  { name: "AUGUSTINE UNIVERSITY", code: "AUGUSTINE", state: "Lagos", city: "Ilara", type: "University" },
  { name: "MCPHERSON UNIVERSITY", code: "MCU", state: "Ogun", city: "Seriki-Sotayo", type: "University" },
  { name: "HALLMARK UNIVERSITY", code: "HALLMARK", state: "Ogun", city: "Ijebu-Itele", type: "University" },
  { name: "SOUTHWESTERN UNIVERSITY", code: "SWU", state: "Ogun", city: "Okun-Owa", type: "University" },
  { name: "ODUDUWA UNIVERSITY", code: "ODUDUWA", state: "Osun", city: "Ipetumodu", type: "University" },
  { name: "AJAYI CROWTHER UNIVERSITY", code: "ACU", state: "Oyo", city: "Oyo", type: "University" },
  { name: "ARTHUR JARVIS UNIVERSITY", code: "AJU", state: "Cross River", city: "Akpabuyo", type: "University" },

  // ── More Colleges of Nursing ──────────────────────────────────────────────────
  { name: "COLLEGE OF NURSING SCIENCES UYO", code: "CNSUY", state: "Akwa Ibom", city: "Uyo", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES YENAGOA", code: "CNSYN", state: "Bayelsa", city: "Yenagoa", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES UMUAHIA", code: "CNSUM", state: "Abia", city: "Umuahia", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES ASABA", code: "CNSAS", state: "Delta", city: "Asaba", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES YOLA", code: "CNSYL", state: "Adamawa", city: "Yola", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES BAUCHI", code: "CNSBA", state: "Bauchi", city: "Bauchi", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES GOMBE", code: "CNSGB", state: "Gombe", city: "Gombe", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES KATSINA", code: "CNSKAT", state: "Katsina", city: "Katsina", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES DAMATURU", code: "CNSDM", state: "Yobe", city: "Damaturu", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES GUSAU", code: "CNSGU", state: "Zamfara", city: "Gusau", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES BIRNIN KEBBI", code: "CNSBK", state: "Kebbi", city: "Birnin Kebbi", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES MINNA", code: "CNSMNA", state: "Niger", city: "Minna", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES LOKOJA", code: "CNSLK", state: "Kogi", city: "Lokoja", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES ADO-EKITI", code: "CNSADE", state: "Ekiti", city: "Ado-Ekiti", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES LAFIA", code: "CNSLF", state: "Nasarawa", city: "Lafia", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING SCIENCES JALINGO", code: "CNSJL", state: "Taraba", city: "Jalingo", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING AND MIDWIFERY ILESA", code: "CNMIL", state: "Osun", city: "Ilesa", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING AND MIDWIFERY AKURE", code: "CNMAK", state: "Ondo", city: "Akure", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING AND MIDWIFERY KANO", code: "CNMK", state: "Kano", city: "Kano", type: "College of Nursing" },
  { name: "COLLEGE OF NURSING AND MIDWIFERY SOKOTO", code: "CNMSO", state: "Sokoto", city: "Sokoto", type: "College of Nursing" },

  // ── More Teaching Hospitals ───────────────────────────────────────────────────
  { name: "SCHOOL OF NURSING UNIVERSITY OF ILORIN TEACHING HOSPITAL", code: "SNUITH", state: "Kwara", city: "Ilorin", type: "School of Nursing" },
  { name: "SCHOOL OF NURSING UNIVERSITY OF JOS TEACHING HOSPITAL", code: "SNUJTH", state: "Plateau", city: "Jos", type: "School of Nursing" },
  { name: "SCHOOL OF NURSING UNIVERSITY OF MAIDUGURI TEACHING HOSPITAL", code: "SNUMTH", state: "Borno", city: "Maiduguri", type: "School of Nursing" },
  { name: "SCHOOL OF NURSING NATIONAL ORTHOPAEDIC HOSPITAL ENUGU", code: "SNNOH", state: "Enugu", city: "Enugu", type: "School of Nursing" },
  { name: "SCHOOL OF NURSING NATIONAL ORTHOPAEDIC HOSPITAL IGBOBI", code: "SNNSHI", state: "Lagos", city: "Lagos", type: "School of Nursing" },
  { name: "SCHOOL OF NURSING IRRUA SPECIALIST TEACHING HOSPITAL", code: "SNISTH", state: "Edo", city: "Irrua", type: "School of Nursing" },
  { name: "SCHOOL OF NURSING DELTA STATE UNIVERSITY TEACHING HOSPITAL", code: "SNDSUTH", state: "Delta", city: "Oghara", type: "School of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE MAKURDI", code: "SNFMCMK", state: "Benue", city: "Makurdi", type: "School of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE NGURU", code: "SNFMCNG", state: "Yobe", city: "Nguru", type: "School of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE GOMBE", code: "SNFMCGB", state: "Gombe", city: "Gombe", type: "School of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE KATSINA", code: "SNFMCKT", state: "Katsina", city: "Katsina", type: "School of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE BAUCHI", code: "SNFMCBA", state: "Bauchi", city: "Bauchi", type: "School of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE GUSAU", code: "SNFMCGU", state: "Zamfara", city: "Gusau", type: "School of Nursing" },
  { name: "SCHOOL OF NURSING FEDERAL MEDICAL CENTRE EBUTE-METTA", code: "SNFMCEM", state: "Lagos", city: "Lagos", type: "School of Nursing" },

  // ── State Schools of Nursing (per state) ─────────────────────────────────────
  { name: "LAGOS STATE SCHOOL OF NURSING IGANDO", code: "LSSNI", state: "Lagos", city: "Igando", type: "School of Nursing" },
  { name: "LAGOS STATE SCHOOL OF NURSING SURULERE", code: "LSSNS", state: "Lagos", city: "Surulere", type: "School of Nursing" },
  { name: "OYO STATE SCHOOL OF NURSING ADEOYO HOSPITAL IBADAN", code: "SSNAH", state: "Oyo", city: "Ibadan", type: "School of Nursing" },
  { name: "OYO STATE SCHOOL OF NURSING OGBOMOSHO", code: "SSNOGB", state: "Oyo", city: "Ogbomosho", type: "School of Nursing" },
  { name: "EKITI STATE SCHOOL OF NURSING ADO-EKITI", code: "ESSNADE", state: "Ekiti", city: "Ado-Ekiti", type: "School of Nursing" },
  { name: "OSUN STATE SCHOOL OF NURSING OSOGBO", code: "OSSNAO", state: "Osun", city: "Osogbo", type: "School of Nursing" },
  { name: "EDO STATE SCHOOL OF NURSING CENTRAL HOSPITAL BENIN", code: "ESSNCHB", state: "Edo", city: "Benin City", type: "School of Nursing" },
  { name: "DELTA STATE SCHOOL OF NURSING WARRI", code: "DSSNW", state: "Delta", city: "Warri", type: "School of Nursing" },
  { name: "BAYELSA STATE SCHOOL OF NURSING YENAGOA", code: "BSSNY", state: "Bayelsa", city: "Yenagoa", type: "School of Nursing" },
  { name: "ANAMBRA STATE SCHOOL OF NURSING NKPOR", code: "ASSNK", state: "Anambra", city: "Nkpor", type: "School of Nursing" },
  { name: "IMO STATE SCHOOL OF NURSING OWERRI", code: "ISSNO", state: "Imo", city: "Owerri", type: "School of Nursing" },
  { name: "ENUGU STATE SCHOOL OF NURSING ENUGU", code: "ESSNE", state: "Enugu", city: "Enugu", type: "School of Nursing" },
  { name: "EBONYI STATE SCHOOL OF NURSING ABAKALIKI", code: "EBSSNA", state: "Ebonyi", city: "Abakaliki", type: "School of Nursing" },
  { name: "ABIA STATE SCHOOL OF NURSING UMUAHIA", code: "ABSSNU", state: "Abia", city: "Umuahia", type: "School of Nursing" },
  { name: "CROSS RIVER STATE SCHOOL OF NURSING CALABAR", code: "CRSSNC", state: "Cross River", city: "Calabar", type: "School of Nursing" },
  { name: "AKWA IBOM STATE SCHOOL OF NURSING UYO", code: "AKSSNU", state: "Akwa Ibom", city: "Uyo", type: "School of Nursing" },
  { name: "RIVERS STATE SCHOOL OF NURSING PORT HARCOURT", code: "RSSNPH", state: "Rivers", city: "Port Harcourt", type: "School of Nursing" },
  { name: "KADUNA STATE SCHOOL OF NURSING GENERAL HOSPITAL", code: "KSSNG", state: "Kaduna", city: "Kaduna", type: "School of Nursing" },
  { name: "KANO STATE SCHOOL OF NURSING KANO", code: "KSSNKN", state: "Kano", city: "Kano", type: "School of Nursing" },
  { name: "PLATEAU STATE SCHOOL OF NURSING JOS", code: "PSSNJ", state: "Plateau", city: "Jos", type: "School of Nursing" },
  { name: "BENUE STATE SCHOOL OF NURSING MAKURDI", code: "BSSNMK", state: "Benue", city: "Makurdi", type: "School of Nursing" },
  { name: "KOGI STATE SCHOOL OF NURSING LOKOJA", code: "KOGISSN", state: "Kogi", city: "Lokoja", type: "School of Nursing" },
  { name: "KWARA STATE SCHOOL OF NURSING ILORIN", code: "KWSSNI", state: "Kwara", city: "Ilorin", type: "School of Nursing" },
  { name: "NIGER STATE SCHOOL OF NURSING MINNA", code: "NISSNM", state: "Niger", city: "Minna", type: "School of Nursing" },
  { name: "BAUCHI STATE SCHOOL OF NURSING BAUCHI", code: "BAUSSN", state: "Bauchi", city: "Bauchi", type: "School of Nursing" },
  { name: "GOMBE STATE SCHOOL OF NURSING GOMBE", code: "GOBSSN", state: "Gombe", city: "Gombe", type: "School of Nursing" },
  { name: "TARABA STATE SCHOOL OF NURSING JALINGO", code: "TSSNJL", state: "Taraba", city: "Jalingo", type: "School of Nursing" },
  { name: "ADAMAWA STATE SCHOOL OF NURSING YOLA", code: "ADSSNY", state: "Adamawa", city: "Yola", type: "School of Nursing" },
  { name: "NASARAWA STATE SCHOOL OF NURSING LAFIA", code: "NASSSNL", state: "Nasarawa", city: "Lafia", type: "School of Nursing" },
  { name: "SOKOTO STATE SCHOOL OF NURSING SOKOTO", code: "SOKSSN", state: "Sokoto", city: "Sokoto", type: "School of Nursing" },
  { name: "KEBBI STATE SCHOOL OF NURSING BIRNIN KEBBI", code: "KEBSSN", state: "Kebbi", city: "Birnin Kebbi", type: "School of Nursing" },
  { name: "ZAMFARA STATE SCHOOL OF NURSING GUSAU", code: "ZAMSSN", state: "Zamfara", city: "Gusau", type: "School of Nursing" },
  { name: "KATSINA STATE SCHOOL OF NURSING KATSINA", code: "KATSSN", state: "Katsina", city: "Katsina", type: "School of Nursing" },
  { name: "JIGAWA STATE SCHOOL OF NURSING DUTSE", code: "JIGSSN", state: "Jigawa", city: "Dutse", type: "School of Nursing" },
  { name: "YOBE STATE SCHOOL OF NURSING DAMATURU", code: "YOBSSN", state: "Yobe", city: "Damaturu", type: "School of Nursing" },
  { name: "BORNO STATE SCHOOL OF NURSING MAIDUGURI", code: "BORSSN", state: "Borno", city: "Maiduguri", type: "School of Nursing" },
  { name: "ONDO STATE SCHOOL OF NURSING AKURE", code: "ONDSSNA", state: "Ondo", city: "Akure", type: "School of Nursing" },
  { name: "OGUN STATE SCHOOL OF NURSING SAGAMU", code: "OGSSNSAG", state: "Ogun", city: "Sagamu", type: "School of Nursing" },

  // ── More Schools of Midwifery ─────────────────────────────────────────────────
  { name: "SCHOOL OF MIDWIFERY SOKOTO", code: "SMSO", state: "Sokoto", city: "Sokoto", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY MAIDUGURI", code: "SMMAID", state: "Borno", city: "Maiduguri", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY DAMATURU", code: "SMDM", state: "Yobe", city: "Damaturu", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY GOMBE", code: "SMGB", state: "Gombe", city: "Gombe", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY BAUCHI", code: "SMBA", state: "Bauchi", city: "Bauchi", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY KATSINA", code: "SMKT", state: "Katsina", city: "Katsina", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY BIRNIN KEBBI", code: "SMBK", state: "Kebbi", city: "Birnin Kebbi", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY GUSAU", code: "SMGU", state: "Zamfara", city: "Gusau", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY MINNA", code: "SMMNA", state: "Niger", city: "Minna", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY LOKOJA", code: "SMLK", state: "Kogi", city: "Lokoja", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY ILORIN", code: "SMIL", state: "Kwara", city: "Ilorin", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY ADO-EKITI", code: "SMADE", state: "Ekiti", city: "Ado-Ekiti", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY AKURE", code: "SMAK", state: "Ondo", city: "Akure", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY ABEOKUTA", code: "SMAB", state: "Ogun", city: "Abeokuta", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY WARRI", code: "SMW", state: "Delta", city: "Warri", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY UMUAHIA", code: "SMUM", state: "Abia", city: "Umuahia", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY UYO", code: "SMUY", state: "Akwa Ibom", city: "Uyo", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY YENAGOA", code: "SMYN", state: "Bayelsa", city: "Yenagoa", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY YOLA", code: "SMYL", state: "Adamawa", city: "Yola", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY JALINGO", code: "SMJL", state: "Taraba", city: "Jalingo", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY LAFIA", code: "SMLF", state: "Nasarawa", city: "Lafia", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY OSOGBO", code: "SMOS", state: "Osun", city: "Osogbo", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY ASABA", code: "SMAS", state: "Delta", city: "Asaba", type: "School of Midwifery" },
  { name: "SCHOOL OF MIDWIFERY AWKA", code: "SMAW", state: "Anambra", city: "Awka", type: "School of Midwifery" },

  // ── More Colleges of Health Technology ───────────────────────────────────────
  { name: "COLLEGE OF HEALTH TECHNOLOGY ILESA", code: "CHTI", state: "Osun", city: "Ilesa", type: "College of Health Technology" },
  { name: "COLLEGE OF HEALTH TECHNOLOGY OTUKPO", code: "CHTO", state: "Benue", city: "Otukpo", type: "College of Health Technology" },
  { name: "COLLEGE OF HEALTH TECHNOLOGY GOMBE", code: "CHTGB", state: "Gombe", city: "Gombe", type: "College of Health Technology" },
  { name: "COLLEGE OF HEALTH TECHNOLOGY NINGI", code: "CHTNI", state: "Bauchi", city: "Ningi", type: "College of Health Technology" },
  { name: "COLLEGE OF HEALTH TECHNOLOGY ZARIA", code: "CHTZ", state: "Kaduna", city: "Zaria", type: "College of Health Technology" },
  { name: "COLLEGE OF HEALTH TECHNOLOGY OFFA", code: "CHTOF", state: "Kwara", city: "Offa", type: "College of Health Technology" },
  { name: "COLLEGE OF HEALTH TECHNOLOGY EDO", code: "CHTED", state: "Edo", city: "Benin City", type: "College of Health Technology" },
  { name: "COLLEGE OF HEALTH SCIENCES IMO", code: "CHSIM", state: "Imo", city: "Owerri", type: "College of Health Technology" },
  { name: "COLLEGE OF HEALTH SCIENCES ENUGU", code: "CHSEN", state: "Enugu", city: "Enugu", type: "College of Health Technology" },
  { name: "OGUN STATE COLLEGE OF HEALTH TECHNOLOGY ILESE-IJEBU", code: "OSCHT", state: "Ogun", city: "Ilese-Ijebu", type: "College of Health Technology" },
  { name: "RIVERS STATE COLLEGE OF HEALTH SCIENCE AND MANAGEMENT TECHNOLOGY", code: "RSCHSMT", state: "Rivers", city: "Rumuola", type: "College of Health Technology" },
  { name: "KOGI STATE COLLEGE OF NURSING SCIENCES OBANGEDE", code: "KSCNS", state: "Kogi", city: "Obangede", type: "College of Health Technology" },

  // ── Polytechnics ─────────────────────────────────────────────────────────────
  { name: "YABA COLLEGE OF TECHNOLOGY", code: "YABATECH", state: "Lagos", city: "Lagos", type: "Polytechnic" },
  { name: "LAGOS STATE POLYTECHNIC IKORODU", code: "LASPOTECH", state: "Lagos", city: "Ikorodu", type: "Polytechnic" },
  { name: "KADUNA POLYTECHNIC", code: "KADPOLY", state: "Kaduna", city: "Kaduna", type: "Polytechnic" },
  { name: "INSTITUTE OF MANAGEMENT AND TECHNOLOGY ENUGU", code: "IMT", state: "Enugu", city: "Enugu", type: "Polytechnic" },
  { name: "FEDERAL POLYTECHNIC BIDA", code: "FPBIDA", state: "Niger", city: "Bida", type: "Polytechnic" },
  { name: "FEDERAL POLYTECHNIC AUCHI", code: "FPAUCHI", state: "Edo", city: "Auchi", type: "Polytechnic" },
  { name: "FEDERAL POLYTECHNIC IDAH", code: "FPIDAH", state: "Kogi", city: "Idah", type: "Polytechnic" },
  { name: "FEDERAL POLYTECHNIC ILARO", code: "FPILARO", state: "Ogun", city: "Ilaro", type: "Polytechnic" },
  { name: "FEDERAL POLYTECHNIC NEKEDE", code: "FPNEKEDE", state: "Imo", city: "Nekede", type: "Polytechnic" },
  { name: "FEDERAL POLYTECHNIC OFFA", code: "FPOFFA", state: "Kwara", city: "Offa", type: "Polytechnic" },
  { name: "FEDERAL POLYTECHNIC MUBI", code: "FPMUBI", state: "Adamawa", city: "Mubi", type: "Polytechnic" },
  { name: "FEDERAL POLYTECHNIC OKO", code: "FEDPOLYOKO", state: "Anambra", city: "Oko", type: "Polytechnic" },
  { name: "FEDERAL POLYTECHNIC NAMODA", code: "FPNAMODA", state: "Zamfara", city: "Kaura Namoda", type: "Polytechnic" },
  { name: "ABIA STATE POLYTECHNIC ABA", code: "ABIAPOLY", state: "Abia", city: "Aba", type: "Polytechnic" },
  { name: "DELTA STATE POLYTECHNIC OGWASHI-UKU", code: "DSPOLYOG", state: "Delta", city: "Ogwashi-Uku", type: "Polytechnic" },
  { name: "DELTA STATE POLYTECHNIC OZORO", code: "DSPOLYOZ", state: "Delta", city: "Ozoro", type: "Polytechnic" },
  { name: "RUFUS GIWA POLYTECHNIC OWO", code: "RUFGIWA", state: "Ondo", city: "Owo", type: "Polytechnic" },
  { name: "OSUN STATE POLYTECHNIC IREE", code: "OSUNPOLY", state: "Osun", city: "Iree", type: "Polytechnic" },
  { name: "KWARA STATE POLYTECHNIC ILORIN", code: "KWARAPOLY", state: "Kwara", city: "Ilorin", type: "Polytechnic" },
  { name: "PLATEAU STATE POLYTECHNIC JOS", code: "PLASPOLY", state: "Plateau", city: "Barkin Ladi", type: "Polytechnic" },
  { name: "KOGI STATE POLYTECHNIC LOKOJA", code: "KOGIPOLY", state: "Kogi", city: "Lokoja", type: "Polytechnic" },
  { name: "NIGER STATE POLYTECHNIC ZUNGERU", code: "NISPOLY", state: "Niger", city: "Zungeru", type: "Polytechnic" },
  { name: "BENUE STATE POLYTECHNIC UGBOKOLO", code: "BSPOLY", state: "Benue", city: "Ugbokolo", type: "Polytechnic" },

  // ── Other / Catchall ─────────────────────────────────────────────────────────
  { name: "OTHER", code: "OTHER", state: "N/A", city: "N/A", type: "Other" },
];

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  O'Prep — Seed Institutions");
  console.log("═══════════════════════════════════════════════════════");
  if (DRY_RUN) console.log("  ⚠  DRY RUN — no changes will be written\n");
  else console.log("");

  const dataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: false,
    entities: [Institution],
    ssl: true,
    extra: { ssl: { rejectUnauthorized: false } },
  });

  await dataSource.initialize();
  console.log("✓ Database connected\n");

  const repo = dataSource.getRepository(Institution);

  let created = 0;
  let skipped = 0;

  for (const data of INSTITUTIONS) {
    const existing = await repo.findOne({ where: { name: data.name } });

    if (existing) {
      console.log(`  ○ ${data.name} — already exists`);
      skipped++;
    } else if (DRY_RUN) {
      console.log(`  ◉ ${data.name} — would create`);
      created++;
    } else {
      const institution = repo.create({ ...data, isActive: true });
      await repo.save(institution);
      console.log(`  ✓ ${data.name} — created`);
      created++;
    }
  }

  console.log("\n═══════════════════════════════════════════════════════");
  console.log(`  Skipped (already exist): ${skipped}`);
  console.log(`  ${DRY_RUN ? "Would create" : "Created"}: ${created}`);
  console.log("═══════════════════════════════════════════════════════\n");

  if (DRY_RUN) {
    console.log("  DRY RUN complete — no changes were made.");
    console.log("  Run without --dry-run to apply changes.\n");
  } else {
    console.log("  ✅ Institutions seeded successfully!\n");
  }

  await dataSource.destroy();
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
