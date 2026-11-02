const Observatory = (() => {
  const CATS = FuelRestStore.CATS;
  let foodWeek;
  let cats;
  let sleep;
  let timeline;

  const grid = "rgba(210, 226, 255, 0.08)";
  const tick = "#8b97ad";

  function defaults() {
    if (!window.Chart) return;
    Chart.defaults.color = tick;
    Chart.defaults.font.family = '"Outfit", "Avenir Next", sans-serif';
    Chart.defaults.font.size = 11;
    Chart.defaults.borderColor = grid;
    Chart.defaults.plugins.legend.labels.boxWidth = 10;
    Chart.defaults.plugins.legend.labels.boxHeight = 10;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.tooltip.backgroundColor = "rgba(10, 14, 24, 0.92)";
    Chart.defaults.plugins.tooltip.borderColor = "rgba(210,226,255,0.16)";
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 10;
  }

  const sleepBand = {
    id: "sleepBand",
    beforeDatasetsDraw(chart) {
      const cfg = chart.options.plugins.sleepBand;
      if (!cfg || !cfg.ranges || !cfg.ranges.length) return;
      const { ctx, chartArea, scales } = chart;
      const x = scales.x;
      ctx.save();
      ctx.fillStyle = "rgba(142, 176, 255, 0.14)";
      for (const range of cfg.ranges) {
        const x1 = x.getPixelForValue(range.from);
        const x2 = x.getPixelForValue(range.to);
        ctx.fillRect(x1, chartArea.top, Math.max(1, x2 - x1), chartArea.height);
      }
      ctx.restore();
    }
  };

  function boot() {
    if (!window.Chart) return;
    defaults();

    foodWeek = new Chart(document.getElementById("chart-food-week"), {
      type: "bar",
      data: { labels: [], datasets: [] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { position: "bottom" } },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { color: tick }
          },
          y: {
            stacked: true,
            grid: { color: grid },
            ticks: { color: tick },
            title: { display: true, text: "kcal", color: tick }
          }
        }
      }
    });

    cats = new Chart(document.getElementById("chart-cats"), {
      type: "doughnut",
      data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0, hoverOffset: 6 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "74%",
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });

    sleep = new Chart(document.getElementById("chart-sleep"), {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Hours asleep",
            data: [],
            backgroundColor: "rgba(142, 176, 255, 0.75)",
            borderRadius: 8,
            barPercentage: 0.62
          },
          {
            type: "line",
            label: "8h reference",
            data: [],
            borderColor: "rgba(255,255,255,0.28)",
            borderDash: [4, 4],
            pointRadius: 0,
            tension: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        scales: {
          x: { grid: { display: false } },
          y: {
            suggestedMin: 0,
            suggestedMax: 10,
            grid: { color: grid },
            title: { display: true, text: "hours", color: tick }
          }
        }
      }
    });

    timeline = new Chart(document.getElementById("chart-timeline"), {
      type: "bar",
      data: {
        labels: hourLabels(),
        datasets: [
          {
            label: "kcal in hour",
            data: new Array(24).fill(0),
            backgroundColor: hourColors(new Array(24).fill("protein")),
            borderRadius: 4,
            barPercentage: 0.78
          }
        ]
      },
      plugins: [sleepBand],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          sleepBand: { ranges: [] }
        },
        scales: {
          x: {
            ticks: {
              color: tick,
              maxRotation: 0,
              callback(value, i) {
                const hour = Number(value);
                const idx = Number.isFinite(hour) ? hour : i;
                return idx % 3 === 0 ? String(idx).padStart(2, "0") : "";
              }
            },
            grid: { color: grid }
          },
          y: {
            grid: { color: grid },
            title: { display: true, text: "kcal", color: tick }
          }
        }
      }
    });
  }

  function hourLabels() {
    return Array.from({ length: 24 }, (_, i) => i);
  }

  function hourColors(catsPerHour) {
    return catsPerHour.map((c) => CATS[c]?.color || "rgba(142,176,255,0.5)");
  }

  function weekday(iso) {
    return new Date(iso + "T12:00:00").toLocaleDateString(undefined, { weekday: "short" });
  }

  function sleepRanges(entry) {
    if (!entry) return [];
    const bed = FuelRestStore.parseTime(entry.bed) / 60;
    const wake = FuelRestStore.parseTime(entry.wake) / 60;
    if (wake > bed) return [{ from: bed, to: Math.min(23.99, wake) }];
    return [
      { from: bed, to: 23.99 },
      { from: 0, to: wake }
    ];
  }

  function update(data, today) {
    if (!foodWeek) return;
    const days = FuelRestStore.lastNDates(7);

    foodWeek.data.labels = days.map(weekday);
    foodWeek.data.datasets = Object.values(CATS).map((cat) => ({
      label: cat.label,
      data: days.map((d) =>
        data.meals
          .filter((m) => m.date === d && m.category === cat.id)
          .reduce((sum, m) => sum + m.calories, 0)
      ),
      backgroundColor: cat.color,
      borderWidth: 0,
      borderRadius: 4,
      stack: "fuel"
    }));
    foodWeek.update();

    const todays = FuelRestStore.todayMeals(data, today);
    const totals = FuelRestStore.totalsByCategory(todays);
    cats.data.labels = Object.values(CATS).map((c) => c.label);
    cats.data.datasets[0].data = Object.keys(CATS).map((k) => totals[k]);
    cats.data.datasets[0].backgroundColor = Object.values(CATS).map((c) => c.color);
    cats.update();

    const sleepHours = days.map((d) => {
      const night = FuelRestStore.sleepFor(data, d);
      return night ? night.durationMin / 60 : 0;
    });
    sleep.data.labels = days.map(weekday);
    sleep.data.datasets[0].data = sleepHours;
    sleep.data.datasets[0].backgroundColor = days.map((d) =>
      d === today ? "rgba(185, 212, 255, 0.95)" : "rgba(76, 111, 255, 0.7)"
    );
    sleep.data.datasets[1].data = days.map(() => 8);
    sleep.update();

    const perHour = new Array(24).fill(0);
    const dominant = new Array(24).fill("protein");
    const hourCat = Array.from({ length: 24 }, () => ({ protein: 0, carbs: 0, fats: 0, produce: 0 }));
    for (const meal of todays) {
      const hour = Math.min(23, Math.floor(FuelRestStore.parseTime(meal.time) / 60));
      perHour[hour] += meal.calories;
      hourCat[hour][meal.category] += meal.calories;
    }
    for (let i = 0; i < 24; i++) {
      let best = "protein";
      let max = -1;
      for (const key of Object.keys(CATS)) {
        if (hourCat[i][key] > max) {
          max = hourCat[i][key];
          best = key;
        }
      }
      dominant[i] = best;
    }

    timeline.data.labels = hourLabels();
    timeline.data.datasets[0].data = perHour;
    timeline.data.datasets[0].backgroundColor = dominant.map((c) => CATS[c].color);
    timeline.options.plugins.sleepBand.ranges = sleepRanges(FuelRestStore.sleepFor(data, today));
    timeline.update();
  }

  return { boot, update };
})();
