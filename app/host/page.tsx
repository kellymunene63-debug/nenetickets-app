# Host Dashboard Patch — `app/host/page.tsx`

## What to change

In `app/host/page.tsx`, find the `loadDashboardData` function (around line 152).

### FIND this block (lines ~167–196):

```ts
    const allSold: any[] = JSON.parse(localStorage.getItem("nene_sold_tickets") || "[]");
    const storedRefunds = JSON.parse(localStorage.getItem("nene_refunds") || "{}");
    setRefunds(storedRefunds);

    // Only show this organizer's events
    const mine = allEvents.filter(
      (ev) => !ev.organizerEmail || ev.organizerEmail === activeHost.email
    );

    setMyEvents(mine);
    setSoldTickets(allSold);

    let totalRevenue = 0;
    let totalCapacity = 0;

    mine.forEach((ev) => {
      const sold = allSold.filter((t) => t.title === ev.title || t.eventTitle === ev.title).length;
      const lowestPrice = ev.tickets?.length
        ? Math.min(...ev.tickets.map((t) => parseInt(t.price) || 0))
        : parseInt(ev.price?.replace(/[^0-9]/g, "") || "0");
      totalRevenue += sold * lowestPrice * 0.95; // Net after 5% platform fee
      totalCapacity += ev.tickets?.reduce((acc, t) => acc + (parseInt(t.capacity) || 0), 0) ?? 0;
    });

    setStats({
      revenue: totalRevenue,
      attendees: allSold.length,
      events: mine.length,
      capacity: totalCapacity,
    });
```

### REPLACE with:

```ts
    const storedRefunds = JSON.parse(localStorage.getItem("nene_refunds") || "{}");
    setRefunds(storedRefunds);

    // Only show this organizer's events
    const mine = allEvents.filter(
      (ev) => !ev.organizerEmail || ev.organizerEmail === activeHost.email
    );
    setMyEvents(mine);

    // Fetch real sales from Redis — localStorage only has tickets bought on THIS device
    let allSold: SoldTicket[] = [];
    if (mine.length > 0) {
      try {
        const titlesParam = mine
          .map((e) => encodeURIComponent(e.title))
          .join(",");
        const salesRes = await fetch(`/api/host/sales?eventTitles=${titlesParam}`);
        if (salesRes.ok) allSold = await salesRes.json();
      } catch {
        // silent — stats will show 0 if API is unreachable
      }
    }
    setSoldTickets(allSold);

    let totalRevenue = 0;
    let totalCapacity = 0;

    mine.forEach((ev) => {
      const evSold = allSold.filter(
        (t) => t.title === ev.title || t.eventTitle === ev.title
      );
      totalRevenue += evSold.reduce((s, t) => s + (t.price ?? 0), 0) * 0.95;
      totalCapacity +=
        ev.tickets?.reduce((acc, t) => acc + (parseInt(t.capacity) || 0), 0) ?? 0;
    });

    setStats({
      revenue:   Math.round(totalRevenue),
      attendees: allSold.reduce((s, t) => s + (t.quantity ?? 1), 0),
      events:    mine.length,
      capacity:  totalCapacity,
    });
```
