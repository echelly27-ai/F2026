const FuelRestStore = (() => {
  const KEY = "fuel-rest-lab-v4";

  const CATS = {
    protein: { id: "protein", label: "Protein", color: "#4ea8ff" },
    carbs: { id: "carbs", label: "Carbohydrates", color: "#ff9a3c" },
    fats: { id: "fats", label: "Fats", color: "#c084fc" },
    produce: { id: "produce", label: "Fruits & vegetables", color: "#4ade80" }
  };

  const MEALS = {
    chlorophyll: {
      id: "chlorophyll",
      label: "Chlorophyll Club",
      kicker: "Glow plate",
      blurb: "A clean high-protein plate. Produce and salmon lead; rest stays long.",
      tone: "balanced",
      sleep: { bed: "22:30", wake: "06:30", quality: 5 },
      meals: [
        ["Wild salmon", 380, "protein", "12:28"],
        ["Lemon quinoa", 170, "carbs", "12:30"],
        ["Charred broccoli", 70, "produce", "12:31"],
        ["Baby kale", 40, "produce", "12:32"],
        ["Blueberries", 70, "produce", "12:33"],
        ["Cold-pressed olive oil", 80, "fats", "12:34"],
        ["Greek yogurt", 160, "protein", "12:36"]
      ]
    },
    walk: {
      id: "walk",
      label: "Main Character Brunch",
      kicker: "Soft life",
      blurb: "Café wellness: avocado, sourdough, smoothie. Tasty, but heavier on fats.",
      tone: "walk",
      sleep: { bed: "23:40", wake: "07:10", quality: 4 },
      meals: [
        ["Sourdough slab", 220, "carbs", "10:12"],
        ["Smashed avocado", 180, "fats", "10:13"],
        ["Chili crisp", 90, "fats", "10:14"],
        ["Strawberry smoothie", 180, "produce", "10:16"],
        ["Honey granola", 200, "carbs", "10:18"],
        ["Peanut butter", 190, "fats", "10:19"]
      ]
    },
    delivery: {
      id: "delivery",
      label: "2AM Delivery",
      kicker: "Crash plate",
      blurb: "Late-night takeout. Refined carbs and fats flood the tank; sleep is short.",
      tone: "poor",
      sleep: { bed: "02:10", wake: "06:15", quality: 2 },
      meals: [
        ["Smash burger", 540, "protein", "21:05"],
        ["Truffle fries", 470, "carbs", "21:06"],
        ["Cola", 220, "carbs", "21:07"],
        ["Tavern pizza", 390, "fats", "21:40"],
        ["Pizza dough", 280, "carbs", "21:41"],
        ["Midnight chips", 280, "fats", "23:50"],
        ["Vanilla soft-serve", 340, "fats", "23:55"]
      ]
    }
  };

  function uid() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  function isoDate(offset = 0) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return d.toISOString().slice(0, 10);
  }

  function mealsFrom(spec, date) {
    return spec.meals.map(([name, calories, category, time]) => ({
      id: uid(),
      name,
      calories,
      category,
      date,
      time
    }));
  }

  function sleepFrom(spec, date) {
    return {
      id: uid(),
      date,
      bed: spec.sleep.bed,
      wake: spec.sleep.wake,
      quality: spec.sleep.quality,
      durationMin: durationMinutes(spec.sleep.bed, spec.sleep.wake)
    };
  }

  function kcalOf(spec) {
    return spec.meals.reduce((sum, item) => sum + item[1], 0);
  }

  function ingredientLine(spec) {
    return spec.meals.map((item) => item[0]).join(" · ");
  }

  function demoData(todayMeal = "chlorophyll") {
    const meals = [];
    const sleeps = [];
    const week = ["chlorophyll", "walk", "delivery", "chlorophyll", "walk", "delivery"];
    week.forEach((id, i) => {
      const date = isoDate(i - 6);
      meals.push(...mealsFrom(MEALS[id], date));
      sleeps.push(sleepFrom(MEALS[id], date));
    });
    const today = isoDate(0);
    meals.push(...mealsFrom(MEALS[todayMeal], today));
    sleeps.push(sleepFrom(MEALS[todayMeal], today));
    return { meals, sleeps, protocol: todayMeal };
  }

  function empty() {
    return demoData("chlorophyll");
  }

  function normalizeId(id) {
    return MEALS[id] ? id : "chlorophyll";
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return saveReturn(demoData("chlorophyll"));
      const data = JSON.parse(raw);
      if (!Array.isArray(data.meals) || !Array.isArray(data.sleeps)) {
        return saveReturn(demoData("chlorophyll"));
      }
      return {
        meals: data.meals,
        sleeps: data.sleeps,
        protocol: normalizeId(data.protocol)
      };
    } catch (_) {
      return saveReturn(demoData("chlorophyll"));
    }
  }

  function saveReturn(data) {
    save(data);
    return data;
  }

  function save(data) {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        meals: data.meals,
        sleeps: data.sleeps,
        protocol: normalizeId(data.protocol)
      })
    );
  }

  function reset() {
    return saveReturn(demoData("chlorophyll"));
  }

  function applyProtocol(data, protocol) {
    const spec = MEALS[normalizeId(protocol)];
    const today = isoDate(0);
    data.meals = data.meals.filter((m) => m.date !== today).concat(mealsFrom(spec, today));
    data.sleeps = data.sleeps.filter((s) => s.date !== today).concat([sleepFrom(spec, today)]);
    data.protocol = spec.id;
    save(data);
    return data;
  }

  function parseTime(hhmm) {
    const [h, m] = String(hhmm || "00:00").split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  function durationMinutes(bed, wake) {
    const a = parseTime(bed);
    const b = parseTime(wake);
    return b > a ? b - a : 24 * 60 - a + b;
  }

  function formatDuration(min) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h}h ${String(m).padStart(2, "0")}m`;
  }

  function todayMeals(data, date) {
    return data.meals.filter((m) => m.date === date);
  }

  function sleepFor(data, date) {
    return data.sleeps.find((s) => s.date === date) || null;
  }

  function lastNDates(n) {
    return Array.from({ length: n }, (_, i) => isoDate(i - (n - 1)));
  }

  function totalsByCategory(meals) {
    const totals = { protein: 0, carbs: 0, fats: 0, produce: 0 };
    for (const m of meals) {
      if (totals[m.category] != null) totals[m.category] += m.calories;
    }
    return totals;
  }

  return {
    KEY,
    CATS,
    MEALS,
    DIETS: MEALS,
    uid,
    isoDate,
    kcalOf,
    ingredientLine,
    empty,
    load,
    save,
    reset,
    applyProtocol,
    parseTime,
    durationMinutes,
    formatDuration,
    todayMeals,
    sleepFor,
    lastNDates,
    totalsByCategory
  };
})();
