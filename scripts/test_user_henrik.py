import httpx, asyncio

async def test_live():
    key = "HDEV-5d855473-1268-4e32-9dab-b03303024296"
    headers = {"Authorization": key, "User-Agent": "ScoutGrid/1.0"}
    async with httpx.AsyncClient(headers=headers, timeout=12.0) as client:
        # 1. Health
        t0 = asyncio.get_event_loop().time()
        res_health = await client.get("https://api.henrikdev.xyz/valorant/v1/version/na")
        latency = (asyncio.get_event_loop().time() - t0) * 1000
        print("Health:", res_health.status_code, f"{latency:.1f}ms")

        # 2. Leaderboard
        res_lb = await client.get("https://api.henrikdev.xyz/valorant/v2/leaderboard/na")
        lb_data = res_lb.json().get("players", [])
        print("Leaderboard NA count:", len(lb_data))
        top1 = lb_data[0]
        puuid = top1["puuid"]
        name = top1["gameName"]
        tag = top1["tagLine"]
        rr = top1["rankedRating"]
        print(f"Top 1: {name}#{tag} (PUUID: {puuid}, RR: {rr})")

        # 3. Matches for top 1
        res_m = await client.get(f"https://api.henrikdev.xyz/valorant/v3/by-puuid/matches/na/{puuid}?size=2")
        matches = res_m.json().get("data", [])
        print("Matches fetched:", len(matches))
        if matches:
            m0 = matches[0]
            print("Match metadata:", m0.get("metadata"))
            players = m0.get("players", {}).get("all_players", [])
            for p in players:
                if p.get("puuid") == puuid or p.get("name").lower() == name.lower():
                    stats = p.get("stats", {})
                    dmg = p.get("damage_made", 0)
                    rounds = m0.get("metadata", {}).get("rounds_played", 1) or 1
                    total_shots = stats.get("headshots", 0) + stats.get("bodyshots", 0) + stats.get("legshots", 0)
                    hs_pct = round((stats.get("headshots", 0) / max(1, total_shots)) * 100, 1)
                    adr = round(dmg / max(1, rounds), 1)
                    acs = round(stats.get("score", 0) / max(1, rounds), 1)
                    print(f"Target player stats in match: Character={p.get('character')}, K={stats.get('kills')}, D={stats.get('deaths')}, A={stats.get('assists')}, ACS={acs}, ADR={adr}, HS%={hs_pct}")

asyncio.run(test_live())
