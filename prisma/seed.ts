import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Real GRE-level words with accurate definitions written independently for this
// seed (not extracted from any external source). Clearly labelled as sample
// data — use the admin CSV importer to load your own 30 real sets.
const sampleSets: { number: number; title: string; color: string; words: { term: string; meaning: string }[] }[] = [
  {
    number: 1,
    title: "Sample Set 1",
    color: "#b91616",
    words: [
      { term: "Aberration", meaning: "A departure from what is normal or expected; an anomaly." },
      { term: "Abscond", meaning: "To leave hurriedly and secretly, typically to avoid detection." },
      { term: "Adulation", meaning: "Excessive or servile flattery; extreme admiration." },
      { term: "Alacrity", meaning: "Brisk and cheerful readiness or eagerness." },
      { term: "Ambiguous", meaning: "Open to more than one interpretation; not clearly defined." },
      { term: "Austere", meaning: "Severe or strict in manner; without comforts or luxuries." },
      { term: "Belie", meaning: "To give a false impression of; to contradict." },
      { term: "Cacophony", meaning: "A harsh, discordant mixture of sounds." },
      { term: "Candor", meaning: "The quality of being open and honest in expression; frankness." },
      { term: "Capricious", meaning: "Given to sudden and unaccountable changes of mood or behavior." },
      { term: "Castigate", meaning: "To reprimand someone severely." },
      { term: "Conflagration", meaning: "An extensive, destructive fire." },
      { term: "Deference", meaning: "Humble submission and respect shown toward another." },
      { term: "Denounce", meaning: "To publicly declare to be wrong or evil." },
      { term: "Ebullient", meaning: "Cheerful and full of energy; exuberant." },
      { term: "Egregious", meaning: "Outstandingly bad; shocking." },
      { term: "Equanimity", meaning: "Mental calmness and composure, especially in a difficult situation." },
      { term: "Ephemeral", meaning: "Lasting for a very short time." },
      { term: "Flout", meaning: "To openly disregard a rule or convention." },
      { term: "Garrulous", meaning: "Excessively talkative, especially on trivial matters." },
    ],
  },
  {
    number: 2,
    title: "Sample Set 2",
    color: "#1f3e78",
    words: [
      { term: "Gregarious", meaning: "Fond of company; sociable." },
      { term: "Hackneyed", meaning: "Lacking originality; overused and trite." },
      { term: "Iconoclast", meaning: "A person who attacks or criticizes cherished beliefs or institutions." },
      { term: "Impetuous", meaning: "Acting or done quickly and without thought." },
      { term: "Inept", meaning: "Having no skill; clumsy or incompetent." },
      { term: "Laconic", meaning: "Using very few words; terse." },
      { term: "Magnanimous", meaning: "Generous or forgiving, especially toward a rival." },
      { term: "Mundane", meaning: "Lacking interest or excitement; ordinary, everyday." },
      { term: "Nefarious", meaning: "Wicked or criminal." },
      { term: "Obdurate", meaning: "Stubbornly refusing to change one's opinion or course of action." },
      { term: "Obsequious", meaning: "Excessively eager to please or obey; servile." },
      { term: "Ostentatious", meaning: "Designed to impress or attract notice; showy." },
      { term: "Parsimonious", meaning: "Unwilling to spend money or use resources; stingy." },
      { term: "Pernicious", meaning: "Having a harmful effect, especially in a gradual or subtle way." },
      { term: "Phlegmatic", meaning: "Having an unemotional, stolid calmness." },
      { term: "Pragmatic", meaning: "Dealing with things sensibly and realistically." },
      { term: "Quixotic", meaning: "Exceedingly idealistic; unrealistic and impractical." },
      { term: "Recalcitrant", meaning: "Having an obstinately uncooperative attitude toward authority." },
      { term: "Sanguine", meaning: "Optimistic or positive, especially in a difficult situation." },
      { term: "Taciturn", meaning: "Reserved or uncommunicative in speech; saying little." },
    ],
  },
  {
    number: 3,
    title: "Sample Set 3",
    color: "#2fb379",
    words: [
      { term: "Tenacious", meaning: "Tending to keep a firm hold; persistent." },
      { term: "Ubiquitous", meaning: "Present, appearing, or found everywhere." },
      { term: "Vindicate", meaning: "To clear someone of blame or suspicion; to justify." },
      { term: "Voracious", meaning: "Having a very eager approach to an activity; extremely hungry." },
      { term: "Wary", meaning: "Feeling or showing caution about possible dangers." },
      { term: "Zealous", meaning: "Having great energy or enthusiasm in pursuit of a cause." },
      { term: "Abate", meaning: "To become less intense or widespread." },
      { term: "Aggrandize", meaning: "To increase the power, status, or wealth of." },
      { term: "Alleviate", meaning: "To make suffering or a problem less severe." },
      { term: "Ameliorate", meaning: "To make a situation better." },
      { term: "Anomaly", meaning: "Something that deviates from what is standard or expected." },
      { term: "Antipathy", meaning: "A deep-seated feeling of dislike or aversion." },
      { term: "Arduous", meaning: "Involving strenuous effort; difficult and tiring." },
      { term: "Articulate", meaning: "Having or showing the ability to speak fluently and coherently." },
      { term: "Assiduous", meaning: "Showing great care and perseverance." },
      { term: "Bolster", meaning: "To support or strengthen." },
      { term: "Cajole", meaning: "To persuade someone to do something by sustained coaxing or flattery." },
      { term: "Deleterious", meaning: "Causing harm or damage." },
      { term: "Enervate", meaning: "To cause someone to feel drained of energy or vitality." },
      { term: "Foment", meaning: "To instigate or stir up trouble." },
    ],
  },
];

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin1234", 10);
  const studentPasswordHash = await bcrypt.hash("student1234", 10);

  await prisma.user.upsert({
    where: { email: "admin@greasy.app" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@greasy.app",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "student@greasy.app" },
    update: {},
    create: {
      name: "Demo Student",
      email: "student@greasy.app",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
    },
  });

  for (const set of sampleSets) {
    const vocabSet = await prisma.vocabSet.upsert({
      where: { number: set.number },
      update: { title: set.title, color: set.color },
      create: { number: set.number, title: set.title, color: set.color },
    });

    for (const word of set.words) {
      const existing = await prisma.word.findFirst({
        where: { setId: vocabSet.id, term: word.term },
      });
      if (!existing) {
        await prisma.word.create({
          data: { setId: vocabSet.id, term: word.term, meaning: word.meaning },
        });
      }
    }
  }

  console.log("Seed complete: 2 users, 3 sample sets, 60 words.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
