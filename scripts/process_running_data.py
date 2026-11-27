#!/usr/bin/env python3
"""Convert Garmin Activities CSV export into assets/data/running.json."""
import csv
import json
import sys
from datetime import datetime

# Path to the Garmin CSV export. Override by passing it as the first argument:
#   python3 scripts/process_running_data.py /path/to/Activities.csv
CSV_PATH = sys.argv[1] if len(sys.argv) > 1 else "/Users/ashutosh/Downloads/Activities-2.csv"
OUT_PATH = "assets/data/running.json"

CITY_ALIASES = {
    "Austin Trail": "Austin",
}

CITY_COORDS = {
    "Palo Alto": (37.4419, -122.1430),
    "Fremont": (37.5485, -121.9886),
    "Austin": (30.2672, -97.7431),
    "Irving": (32.8140, -96.9489),
    "Fort Worth": (32.7555, -97.3308),
    "Malta": (42.9848, -73.7873),
    "Boise": (43.6150, -116.2023),
    "Chicago": (41.8781, -87.6298),
    "Menlo Park": (37.4530, -122.1817),
    "San Francisco": (37.7749, -122.4194),
    "Dallas": (32.7767, -96.7970),
    "Anaheim": (33.8366, -117.9143),
    "Denton County": (33.2148, -97.1331),
    "DuPage County": (41.8661, -88.0834),
    "Indianapolis": (39.7684, -86.1581),
    "San Diego": (32.7157, -117.1611),
    "Siskiyou County": (41.7295, -122.6345),
    "Willowbrook": (41.7686, -87.9412),
    "Boulder": (40.0150, -105.2705),
    "Clifton Park": (42.8584, -73.7757),
    "East Lansing": (42.7370, -84.4839),
    "Los Angeles": (34.0522, -118.2437),
    "Marin County": (38.0834, -122.7633),
    "Mountain View": (37.3861, -122.0839),
    "Santa Clara County": (37.3382, -121.8863),
    "Saratoga Springs": (43.0831, -73.7846),
    "Seattle": (47.6062, -122.3321),
    # Mumbai deliberately excluded — international, handled as a footnote, not on the US map.
}


def parse_city(title, activity_type):
    if activity_type == "Treadmill Running":
        return None
    if " - " in title:
        city = title.split(" - ")[0].strip()
    elif title.endswith(" Running"):
        city = title[: -len(" Running")].strip()
    else:
        return None
    if not city:
        return None
    return CITY_ALIASES.get(city, city)


def parse_date(raw):
    return datetime.strptime(raw, "%m/%d/%y %H:%M").strftime("%Y-%m-%d")


def parse_hms_seconds(raw):
    parts = raw.split(":")
    parts = [float(p) for p in parts]
    if len(parts) == 3:
        h, m, s = parts
    elif len(parts) == 2:
        h, (m, s) = 0, parts
    else:
        raise ValueError(f"unexpected time format: {raw}")
    return int(h * 3600 + m * 60 + s)


def parse_pace_seconds(raw):
    if raw in ("--", ""):
        return None
    m, s = raw.split(":")
    return int(m) * 60 + int(s)


def parse_int(raw):
    if raw in ("--", ""):
        return None
    return int(raw.replace(",", "").lstrip("'"))


def parse_float(raw):
    if raw in ("--", ""):
        return None
    return float(raw.replace(",", ""))


def main():
    with open(CSV_PATH, newline="") as f:
        rows = list(csv.DictReader(f))

    missing_cities = set()
    records = []
    for row in rows:
        city = parse_city(row["Title"], row["Activity Type"])
        lat = lng = None
        if city is not None and city != "Mumbai":
            coords = CITY_COORDS.get(city)
            if coords is None:
                missing_cities.add(city)
            else:
                lat, lng = coords

        records.append(
            {
                "date": parse_date(row["Date"]),
                "type": row["Activity Type"],
                "title": row["Title"],
                "city": city,
                "lat": lat,
                "lng": lng,
                "distance_km": parse_float(row["Distance"]),
                # `time_s` is the elapsed/official finish time from the CSV's
                # `Time` column; `moving_time_s` excludes auto-paused stretches.
                # The hero stats use `time_s` so the marathon shows its real
                # finish time.
                "time_s": parse_hms_seconds(row["Time"]),
                "moving_time_s": parse_hms_seconds(row["Moving Time"]),
                "avg_hr": parse_int(row["Avg HR"]),
                "max_hr": parse_int(row["Max HR"]),
                "avg_cadence": parse_int(row["Avg Run Cadence"]),
                "avg_pace_s_per_km": parse_pace_seconds(row["Avg Pace"]),
                "elevation_gain_m": parse_int(row["Total Ascent"]),
            }
        )

    if missing_cities:
        print(f"WARNING: no coordinates for cities: {sorted(missing_cities)}", file=sys.stderr)

    with open(OUT_PATH, "w") as f:
        json.dump(records, f, indent=2)

    print(f"Wrote {len(records)} records to {OUT_PATH}")


if __name__ == "__main__":
    main()
