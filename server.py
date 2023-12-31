from flask import Flask, jsonify, render_template
import pandas as pd
from generateData import DummyDataGenerator

data = DummyDataGenerator()
data.generateRecords()
conn = data.createConnection()

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/get-products/")
def get_products():
    df = pd.read_sql_query("SELECT DISTINCT item FROM sales", conn)
    # print(data)
    return df.to_json(orient="records")


@app.route("/get-sales-map/<item>/<branch>/<year>")
def get_sales_map(item, branch, year):
    if item == "all" and branch == "all" and year == "all":
        df = pd.read_sql_query("SELECT lat,long FROM sales", conn)
    elif item != "all" and branch == "all" and year == "all":
        df = pd.read_sql_query(
            "SELECT lat,long FROM sales WHERE item = '{}'".format(item), conn
        )
    elif item == "all" and branch != "all" and year == "all":
        df = pd.read_sql_query(
            "SELECT lat,long FROM sales WHERE soldFrom = '{}'".format(branch), conn
        )
    elif item == "all" and branch == "all" and year != "all":
        df = pd.read_sql_query(
            "SELECT lat,long FROM sales WHERE strftime('%Y', datesold) = '{}'".format(
                year
            ),
            conn,
        )
    elif item != "all" and branch != "all" and year == "all":
        df = pd.read_sql_query(
            "SELECT lat,long FROM sales WHERE item = '{0}' AND soldFrom = '{1}'".format(
                item, branch
            ),
            conn,
        )
    elif item != "all" and branch == "all" and year != "all":
        df = pd.read_sql_query(
            "SELECT lat,long FROM sales WHERE item = '{0}' AND strftime('%Y', datesold) = '{1}'".format(
                item, year
            ),
            conn,
        )
    elif item == "all" and branch != "all" and year != "all":
        df = pd.read_sql_query(
            "SELECT lat,long FROM sales WHERE soldFrom = '{0}' AND strftime('%Y', datesold) = '{1}'".format(
                branch, year
            ),
            conn,
        )
    else:
        df = pd.read_sql_query(
            "SELECT lat,long FROM sales WHERE item = '{0}' AND soldFrom = '{1}' AND strftime('%Y', datesold) = '{2}'".format(
                item, branch, year
            ),
            conn,
        )
    # print(data)
    return df.to_json(orient="records")


@app.route("/get-trends/<branch>/<year>")
def get_datachart(branch, year):
    if branch == "all" and year == "all":
        df = pd.read_sql_query("SELECT datesold,item,qty FROM sales", conn)
    elif branch == "all" and year != "all":
        df = pd.read_sql_query(
            "SELECT datesold,item,qty FROM sales WHERE strftime('%Y', datesold) = '{}'".format(
                year
            ),
            conn,
        )
    elif branch != "all" and year == "all":
        df = pd.read_sql_query(
            "SELECT datesold,item,qty FROM sales WHERE soldFrom = '{}'".format(branch),
            conn,
        )
    else:
        df = pd.read_sql_query(
            "SELECT datesold,item,qty FROM sales WHERE soldFrom = '{0}' AND strftime('%Y', datesold) = '{1}'".format(
                branch, year
            ),
            conn,
        )

    return df.to_json(orient="records")


@app.route("/get-sales-chart-bygender/<branch>/<year>")
def get_sales_chart_bygender(branch, year):
    if branch == "all" and year == "all":
        df = pd.read_sql_query(
            "SELECT item as product,SUM(CASE WHEN gender = 'male' THEN qty ELSE 0 END) AS male, SUM(CASE WHEN gender = 'female' THEN qty ELSE 0 END) AS female FROM sales GROUP BY item;",
            conn,
        )
    elif branch == "all" and year != "all":
        df = pd.read_sql_query(
            "SELECT item as product,SUM(CASE WHEN gender = 'male' THEN qty ELSE 0 END) AS male, SUM(CASE WHEN gender = 'female' THEN qty ELSE 0 END) AS female FROM sales where strftime('%Y', datesold) = '{}' GROUP BY item;".format(
                year
            ),
            conn,
        )
    elif branch != "all" and year == "all":
        df = pd.read_sql_query(
            "SELECT item as product,SUM(CASE WHEN gender = 'male' THEN qty ELSE 0 END) AS male, SUM(CASE WHEN gender = 'female' THEN qty ELSE 0 END) AS female FROM sales where soldFrom = '{}' GROUP BY item;".format(
                branch
            ),
            conn,
        )
    else:
        df = pd.read_sql_query(
            "SELECT item as product,SUM(CASE WHEN gender = 'male' THEN qty ELSE 0 END) AS male, SUM(CASE WHEN gender = 'female' THEN qty ELSE 0 END) AS female FROM sales where soldFrom = '{0}' AND strftime('%Y', datesold) = '{1}' GROUP BY item;".format(
                branch, year
            ),
            conn,
        )
    return df.to_json(orient="records")


@app.route("/get-rates-chart-bygender/<branch>/<year>")
def get_rating_chart_bygender(branch, year):
    
    if branch == "all" and year == "all":
        df = pd.read_sql_query(
            "SELECT item as product,avg(CASE WHEN gender = 'male' THEN rating ELSE 0 END) AS male, avg(CASE WHEN gender = 'female' THEN rating ELSE 0 END) AS female FROM sales GROUP BY item;",
            conn,
        )
    elif branch == "all" and year != "all":
        df = pd.read_sql_query(
            "SELECT item as product,avg(CASE WHEN gender = 'male' THEN rating ELSE 0 END) AS male, avg(CASE WHEN gender = 'female' THEN rating ELSE 0 END) AS female FROM sales where strftime('%Y', datesold) = '{}' GROUP BY item;".format(
                year
            ),
            conn,
        )
    elif branch != "all" and year == "all":
        df = pd.read_sql_query(
            "SELECT item as product,avg(CASE WHEN gender = 'male' THEN rating ELSE 0 END) AS male, avg(CASE WHEN gender = 'female' THEN rating ELSE 0 END) AS female FROM sales where soldFrom = '{}' GROUP BY item;".format(
                branch
            ),
            conn,
        )
    else:
        df = pd.read_sql_query(
            "SELECT item as product,avg(CASE WHEN gender = 'male' THEN rating ELSE 0 END) AS male, avg(CASE WHEN gender = 'female' THEN rating ELSE 0 END) AS female FROM sales where soldFrom = '{0}' AND strftime('%Y', datesold) = '{1}' GROUP BY item;".format(
                branch, year
            ),
            conn,
        )
    
    return df.to_json(orient="records")


@app.route("/get-sales/<branch>/<year>")
def get_sales(branch, year):
    if branch == "all" and year == "all":
        df = pd.read_sql_query(
            "SELECT price*qty as totalSales, sum(qty) as soldQty, item FROM sales group by item",
            conn,
        )
    elif branch == "all" and year != "all":
        df = pd.read_sql_query(
            "SELECT price*qty as totalSales, sum(qty) as soldQty, item FROM sales WHERE strftime('%Y', datesold) = '{}' group by item".format(
                year
            ),
            conn,
        )
    elif branch != "all" and year == "all":
        df = pd.read_sql_query(
            "SELECT price*qty as totalSales, sum(qty) as soldQty, item FROM sales WHERE soldFrom = '{}' group by item".format(
                branch
            ),
            conn,
        )
    else:
        df = pd.read_sql_query(
            "SELECT sum(qty) as soldQty, price*qty as totalSales ,item FROM sales WHERE soldFrom = '{0}' AND strftime('%Y', datesold) = '{1}' group by item".format(
                branch, year
            ),
            conn,
        )
    df.sort_values(by=["totalSales"], inplace=True, ascending=False)
    return df.to_json(orient="records")


if __name__ == "__main__":
    app.run(debug=True)
