import csv
from random import randrange, choice, uniform, seed
from datetime import datetime as dt, timedelta as td
import sqlite3
from sqlalchemy import create_engine
import pandas as pd

seed(42)
class DummyDataGenerator:
    def __init__(self, numberOfYears=5, dest="./"):
        self.products = [
            {"name": "EPOC X", "price": 999},
            {
                "name": "FLEX Saline",
                "price": 1_999,
            },
            {
                "name": "Flex Gel",
                "price": 2_299,
            },
            {"name": "INSIGHT", "price": 499},
            {"name": "MN8", "price": 399},
        ]
        self.numberOfYears = numberOfYears

        self.path = dest + "data.csv"

    def __random_date(self, start):
        current = start
        l = 365 * self.numberOfYears
        while l >= 0:
            current = current + td(
                days=1,
            )
            yield current
            l -= 1

    def generateRecords(self):
        self.allRecords = []
        for d in self.__random_date(dt.now()):
            for product in self.products:
                countries = pd.read_csv("countries.csv")
                country = countries.sample()
                qty = randrange(1, 500)
                info = {
                    "dateSold": d.isoformat(),
                    "item": product["name"],
                    "qty": qty,
                    "price": product["price"],
                    "lat": country["lat"].values[0] + uniform(0.0, 0.9999),
                    "long": country["long"].values[0] + uniform(0.0, 0.9999),
                    "gender": choice(["male", "female"]),
                    "rating": randrange(0, 6),
                    "soldFrom": choice(["New York", "Shanghai", "Cairo"]),
                }
                self.allRecords.append(info)

        self.allRecords.sort(key=lambda x: x["dateSold"])
        return self.allRecords

    def saveRecords(self, format="csv"):
        if format == "csv":
            with open(self.path, "w", newline="", encoding="utf-8") as csvfile:
                fieldnames = [
                    "dateSold",
                    "item",
                    "qty",
                    "price",
                    "lat",
                    "long",
                    "gender",
                    "rating",
                    "soldFrom",
                ]
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

                writer.writeheader()
                for record in self.allRecords:
                    writer.writerow(record)
        elif format == "sql":
            df = pd.DataFrame(self.allRecords)
            df["dateSold"] = pd.to_datetime(df["dateSold"])
            conn = sqlite3.connect("data.db")
            df.to_sql("sales", conn, if_exists="replace")
            conn.close()

    def createConnection(self):
        df = pd.DataFrame(self.allRecords)
        df["dateSold"] = pd.to_datetime(df["dateSold"])
        conn = sqlite3.connect("data.db", check_same_thread=False)
        df.to_sql("sales", conn, if_exists="replace")
        return conn


if __name__ == "__main__":
    m = DummyDataGenerator()
    print(len(m.generateRecords()))
    # m.saveRecords(format="sql")
