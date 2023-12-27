import csv
from random import randrange, choice, uniform
from datetime import datetime as dt, timedelta as td
import matplotlib.pyplot as plt


class DummyDataGenerator:
    def __init__(self, numberOfYears=5, dest="./"):
        self.products = [
            {"name": "EPOC X – 14 Channel Wireless EEG Headset", "price": 999},
            {
                "name": "FLEX Saline – 32 Channel Wireless Saline Head Cap System",
                "price": 1_999,
            },
            {
                "name": "Flex Gel – 32 Channel Wireless Gel Head Cap System",
                "price": 2_299,
            },
            {"name": "INSIGHT – 5 Channel Wireless EEG Headset", "price": 499},
            {"name": "MN8 – 2 Channel EEG Earbuds", "price": 399},
        ]
        self.numberOfYears = numberOfYears

        self.path = dest + "data.csv"

    def __random_date(self, start, l):
        current = start
        while l >= 0:
            curr = current + td(
                days=randrange(start=0, stop=365 * self.numberOfYears),
                hours=randrange(start=0, stop=24),
                minutes=randrange(60),
            )
            yield curr
            l -= 1

    def generateRecords(self, numOfRecords=1000):
        self.allRecords = []
        for d in self.__random_date(dt.now(), numOfRecords * (self.numberOfYears // 2)):
            product = choice(self.products)
            qty = randrange(0, 5)
            info = {
                "dateSold": d.isoformat(),
                "item": product["name"],
                "qty": qty,
                "price": product["price"],
                "lat": uniform(-90.0, 90.0),
                "long": uniform(-180, 180),
                "gender": choice(["male", "female"]),
                "rating": randrange(0, 6),
                "from": choice(["New York", "Shanghai", "Cairo"]),
            }
            self.allRecords.append(info)

        self.allRecords.sort(key=lambda x: x["dateSold"])
        return self.allRecords

    def saveRecords():
        with open("names.csv", "w", newline="") as csvfile:
            fieldnames = ["dateSold", "item","quantity","price","lat","long","gender","rating","soldFromBranch"]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            writer.writeheader()
            writer.writerow({"first_name": "Baked", "last_name": "Beans"})
            writer.writerow({"first_name": "Lovely", "last_name": "Spam"})
            writer.writerow({"first_name": "Wonderful", "last_name": "Spam"})


m = DummyDataGenerator()
print(len(m.generateRecords()))
