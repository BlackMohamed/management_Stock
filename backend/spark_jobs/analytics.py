from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sum, count, when
import sys
import json
from datetime import datetime, timedelta

spark = SparkSession.builder.appName("StockAnalytics").getOrCreate()

def low_stock():
    products = spark.read.format("mongo").load("products")
    return products.filter(col("quantity") < 10).toJSON().collect()

def top_sellers():
    movements = spark.read.format("mongo").load("movements")
    exits = movements.filter(col("type") == "exit").groupBy("productId").agg(sum("quantity").alias("total_sold")).orderBy(col("total_sold").desc()).limit(10)
    return exits.toJSON().collect()

def inactive_products():
    one_month_ago = (datetime.now() - timedelta(days=30)).isoformat()
    movements = spark.read.format("mongo").load("movements")
    products = spark.read.format("mongo").load("products")
    active_products = movements.filter(col("date") >= one_month_ago).select("productId").distinct()
    inactive = products.join(active_products, "productId", "left_anti")
    return inactive.toJSON().collect()

def total_movements(params):
    product_id = params.get("productId")
    movements = spark.read.format("mongo").load("movements")
    result = movements.filter(col("productId") == product_id).groupBy("type").agg(sum("quantity").alias("total"))
    return result.toJSON().collect()

def recent_alerts():
    seven_days_ago = (datetime.now() - timedelta(days=7)).isoformat()
    alerts = spark.read.format("mongo").load("alerts")
    return alerts.filter(col("date") >= seven_days_ago).toJSON().collect()

def stock_by_category():
    products = spark.read.format("mongo").load("products")
    return products.groupBy("category").agg(sum("quantity").alias("total_stock")).orderBy("category").toJSON().collect()

if __name__ == "__main__":
    job_type = sys.argv[1]
    params = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
    result = globals()[job_type](params)
    print(json.dumps(result))
