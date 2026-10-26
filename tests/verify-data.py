import json
from pathlib import Path

data_path = Path(__file__).parents[1] / "data" / "bibles.json"
data = json.loads(data_path.read_text(encoding="utf-8"))
rows = data["verses"]
expected = {"KJV": 31102, "WEB": 31095, "ASV": 31086, "RVR09": 31084, "ALMEIDA": 31102}
assert len(rows) == data["meta"]["verses"] == 31102
assert len({row["b"] for row in rows}) == data["meta"]["books"] == 66
keys = [(row["b"], row["c"], row["v"]) for row in rows]
assert len(keys) == len(set(keys)), "duplicate Bible reference rows"
assert all(row.get("n") and isinstance(row.get("c"), int) and isinstance(row.get("v"), int) for row in rows)
for code, count in expected.items():
    actual = sum(bool(row.get(code)) for row in rows)
    assert actual == count, f"{code}: expected {count}, got {actual}"
    assert all(isinstance(row.get(code, ""), str) for row in rows)
ref = next(row for row in rows if (row["n"], row["c"], row["v"]) == ("John", 3, 16))
assert all(ref.get(code) for code in expected), "John 3:16 must exist in each edition"
print(f"PASS corpus: {len(rows):,} unique references across 66 books")
for code, count in expected.items():
    print(f"PASS {code}: {count:,} verse texts")
print(f"PASS John 3:16 in all {len(expected)} bundled editions")
