"use strict";
let productFilter = document.getElementById('productFilter');
let yearFilter = document.getElementById('yearFilter');
let branchFilter = document.getElementById('branchFilter');
var trendChart, mapsChart, stackedByGenderChart, ratingByGenderChart

function createTrendsChart(data) {


    am5.ready(function () {


        // Create root element
        // https://www.amcharts.com/docs/v5/getting-started/#Root_element
        trendChart = am5.Root.new("trendChart");


        // Set themes
        // https://www.amcharts.com/docs/v5/concepts/themes/
        trendChart.setThemes([
            am5themes_Animated.new(trendChart)
        ]);


        // Create chart
        // https://www.amcharts.com/docs/v5/charts/xy-chart/
        let chart = trendChart.container.children.push(am5xy.XYChart.new(trendChart, {
            panX: true,
            panY: true,
            wheelX: "panX",
            wheelY: "zoomX",
            pinchZoomX: true,
            paddingLeft: 0
        }));


        // Add cursor
        // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
        var cursor = chart.set("cursor", am5xy.XYCursor.new(trendChart, {
            behavior: "none"
        }));
        cursor.lineY.set("visible", false);


        // Create axes
        // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
        var xAxis = chart.xAxes.push(am5xy.DateAxis.new(trendChart, {
            maxDeviation: 0.2,
            groupData: true,
            groupIntervals: [
                { timeUnit: "day", count: 1 },
                { timeUnit: "month", count: 1 },
                { timeUnit: "year", count: 1 }
            ],
            baseInterval: {
                timeUnit: "day",
                count: 1
            },

            renderer: am5xy.AxisRendererX.new(trendChart, {
                minorGridEnabled: true
            }),
            tooltip: am5.Tooltip.new(trendChart, {})
        }));

        var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(trendChart, {
            renderer: am5xy.AxisRendererY.new(trendChart, {
                pan: "zoom"
            })
        }));



        let groupedData = Object.groupBy(data, ({ item }) => item)
        // Add series
        let allDseries = []

        Object.entries(groupedData).forEach(el => {
            const [key, value] = el;

            var series = chart.series.push(am5xy.LineSeries.new(trendChart, {
                name: key,
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: "qty",
                valueXField: "dateSold",
                tooltip: am5.Tooltip.new(trendChart, {
                    labelText: "{name}: {valueY}"
                })
            }));

            series.data.processor = am5.DataProcessor.new(trendChart, {
                numericFields: ["qty"],
                dateFields: ["dateSold"],
                dateFormat: "i" // "yyyy-MM-dd"
            });
            series.data.setAll(value)

            series.appear(1000);
        });
        console.log(groupedData)


        // Add scrollbar
        // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
        chart.set("scrollbarX", am5.Scrollbar.new(trendChart, {
            orientation: "horizontal"
        }));

        let legend = chart.children.push(am5.Legend.new(trendChart, {
            y: am5.percent(68),
            x: am5.percent(80),
            opacity: 0.8,
            background: am5.RoundedRectangle.new(trendChart, {
                fill: am5.color(0xffffff),
                fillOpacity: 1
            }),
            centerY: am5.percent(50),
            layout: trendChart.verticalLayout
        }));
        legend.data.setAll(chart.series.values);
        // Make stuff animate on load
        // https://www.amcharts.com/docs/v5/concepts/animations/
        chart.appear(1000, 100);

    });
}

function createMapsChart(data) {
    am5.ready(function () {

        // Create root element
        // https://www.amcharts.com/docs/v5/getting-started/#Root_element
        mapsChart = am5.Root.new("soldToChart");

        // Set themes
        // https://www.amcharts.com/docs/v5/concepts/themes/
        mapsChart.setThemes([
            am5themes_Animated.new(mapsChart)
        ]);

        // Create the map chart
        // https://www.amcharts.com/docs/v5/charts/map-chart/
        var chart = mapsChart.container.children.push(
            am5map.MapChart.new(mapsChart, {
                panX: "rotateX",
                panY: "translateY",
                projection: am5map.geoNaturalEarth1(),
            })
        );

        var polygonSeries = chart.series.push(
            am5map.MapPolygonSeries.new(mapsChart, {
                geoJSON: am5geodata_worldLow
            })
        );

        polygonSeries.mapPolygons.template.setAll({
            fill: mapsChart.interfaceColors.get("alternativeBackground"),
            fillOpacity: 0.15,
            strokeWidth: 0.5,
            stroke: mapsChart.interfaceColors.get("background")
        });

        chart.set("zoomControl", am5map.ZoomControl.new(mapsChart, {
        }));

        var pointSeries = chart.series.push(
            am5map.MapPointSeries.new(mapsChart, {
                latitudeField: "lat",
                longitudeField: "long"
            })
        );

        pointSeries.bullets.push(function () {
            return am5.Bullet.new(mapsChart, {
                sprite: am5.Circle.new(mapsChart, {
                    radius: 5,
                    fill: am5.color(0xff0000)
                })
            });
        });

        pointSeries.data.setAll(data);

        // Make stuff animate on load
        chart.appear(1000, 100);

    });
}

function createSaleByProduct(data) {
    let salesByItem = ''
    let totalSalesSelector = document.getElementById('totalSales');
    let allTotalSales = 0;
    data.forEach(el => {
        salesByItem += `
        <div class="card me-2 productSalesCard">
                <div class="card-body">
                  <h5 class="card-title">${new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            currencyDisplay: "narrowSymbol",
            minimumFractionDigits: 2,
            notation: "compact",
        }).format(el.totalSales)} </h5>
                  <p class="card-text">${el.item} &bull; ${new Intl.NumberFormat("en-US", {

            notation: "compact",
        }).format(el.soldQty)}</p>
                </div>
              </div>
        `
        allTotalSales += el.totalSales;
    })
    totalSalesSelector.innerText = `${new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        currencyDisplay: "narrowSymbol",
        minimumFractionDigits: 2,
        notation: "compact",
    }).format(allTotalSales)}`
    document.getElementById('productSalesByItem').innerHTML = salesByItem;
}

function createStackedSalesChartByGender(data) {
    am5.ready(function () {


        // Create root element
        // https://www.amcharts.com/docs/v5/getting-started/#Root_element
        stackedByGenderChart = am5.Root.new("salesByGenderChart");


        // Set themes
        // https://www.amcharts.com/docs/v5/concepts/themes/
        stackedByGenderChart.setThemes([
            am5themes_Animated.new(stackedByGenderChart)
        ]);


        // Create chart
        // https://www.amcharts.com/docs/v5/charts/xy-chart/
        var chart = stackedByGenderChart.container.children.push(am5xy.XYChart.new(stackedByGenderChart, {
            panX: true,
            panY: false,
            wheelX: "panX",
            wheelY: "zoomX",
            paddingLeft: 0,
            layout: stackedByGenderChart.verticalLayout
        }));

        // Add legend
        // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
        var legend = chart.children.push(am5.Legend.new(stackedByGenderChart, {
            centerX: am5.p50,
            x: am5.p50
        }));

        // Create axes
        // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
        var xRenderer = am5xy.AxisRendererX.new(stackedByGenderChart, {
            cellStartLocation: 0.1,
            cellEndLocation: 0.9,
            minorGridEnabled: true
        });

        var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(stackedByGenderChart, {
            categoryField: "product",
            renderer: xRenderer,
            tooltip: am5.Tooltip.new(stackedByGenderChart, {})
        }));

        xRenderer.grid.template.setAll({
            location: 1
        })

        xAxis.data.setAll(data);

        var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(stackedByGenderChart, {
            min: 0,
            renderer: am5xy.AxisRendererY.new(stackedByGenderChart, {
                strokeOpacity: 0.1
            })
        }));


        // Add series
        // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
        function makeSeries(name, fieldName, stacked) {
            var series = chart.series.push(am5xy.ColumnSeries.new(stackedByGenderChart, {
                stacked: stacked,
                name: name,
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: fieldName,
                categoryXField: "product"
            }));

            series.columns.template.setAll({
                tooltipText: "{name}, {categoryX}:{valueY}",
                width: am5.percent(90),
                tooltipY: am5.percent(10)
            });
            series.data.setAll(data);

            // Make stuff animate on load
            // https://www.amcharts.com/docs/v5/concepts/animations/
            series.appear();

            series.bullets.push(function () {
                return am5.Bullet.new(stackedByGenderChart, {
                    locationY: 0.5,
                    sprite: am5.Label.new(stackedByGenderChart, {
                        text: "{valueY}",
                        fill: stackedByGenderChart.interfaceColors.get("alternativeText"),
                        centerY: am5.percent(50),
                        centerX: am5.percent(50),
                        populateText: true
                    })
                });
            });

            legend.data.push(series);
        }

        makeSeries("Male", "male", true);
        makeSeries("Female", "female", true);

        // Make stuff animate on load
        // https://www.amcharts.com/docs/v5/concepts/animations/
        chart.appear(1000, 100);

    });
}

function createRatingChartByGender(data) {
    am5.ready(function () {


        // Create root element
        // https://www.amcharts.com/docs/v5/getting-started/#Root_element
        ratingByGenderChart = am5.Root.new("ratesByGenderChart");


        // Set themes
        // https://www.amcharts.com/docs/v5/concepts/themes/
        ratingByGenderChart.setThemes([
            am5themes_Animated.new(ratingByGenderChart)
        ]);


        // Create chart
        // https://www.amcharts.com/docs/v5/charts/xy-chart/
        var chart = ratingByGenderChart.container.children.push(am5xy.XYChart.new(ratingByGenderChart, {
            panX: true,
            panY: false,
            wheelX: "panX",
            wheelY: "zoomX",
            paddingLeft: 0,
            layout: ratingByGenderChart.verticalLayout
        }));

        // Add legend
        // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
        var legend = chart.children.push(am5.Legend.new(ratingByGenderChart, {
            centerX: am5.p50,
            x: am5.p50
        }));

        // Create axes
        // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
        var xRenderer = am5xy.AxisRendererX.new(ratingByGenderChart, {
            cellStartLocation: 0.1,
            cellEndLocation: 0.9,
            minorGridEnabled: true
        });

        var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(ratingByGenderChart, {
            categoryField: "product",
            renderer: xRenderer,
            tooltip: am5.Tooltip.new(ratingByGenderChart, {})
        }));

        xRenderer.grid.template.setAll({
            location: 1
        })

        xAxis.data.setAll(data);

        var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(ratingByGenderChart, {
            min: 0,
            renderer: am5xy.AxisRendererY.new(ratingByGenderChart, {
                strokeOpacity: 0.1
            })
        }));


        // Add series
        // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
        function makeSeries(name, fieldName, stacked) {
            var series = chart.series.push(am5xy.ColumnSeries.new(ratingByGenderChart, {
                stacked: stacked,
                name: name,
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: fieldName,
                categoryXField: "product"
            }));

            series.columns.template.setAll({
                tooltipText: "{name}, {categoryX}:{valueY}",
                width: am5.percent(90),
                tooltipY: am5.percent(10)
            });
            series.data.setAll(data);

            // Make stuff animate on load
            // https://www.amcharts.com/docs/v5/concepts/animations/
            series.appear();

            series.bullets.push(function () {
                return am5.Bullet.new(ratingByGenderChart, {
                    locationY: 0.5,
                    sprite: am5.Label.new(ratingByGenderChart, {
                        text: "{valueY.formatNumber('#.##')}",
                        fill: ratingByGenderChart.interfaceColors.get("alternativeText"),
                        centerY: am5.percent(50),
                        centerX: am5.percent(50),
                        populateText: true
                    })
                });
            });

            legend.data.push(series);
        }

        makeSeries("Male", "male", false);
        makeSeries("Female", "female", false);

        // Make stuff animate on load
        // https://www.amcharts.com/docs/v5/concepts/animations/
        chart.appear(1000, 100);

    });
}

let updateCharts = (e) => { 
    if (trendChart) {
        trendChart.dispose();
        stackedByGenderChart.dispose();
        ratingByGenderChart.dispose();
        mapsChart.dispose();
    }
    fetch(`/get-sales/${branchFilter.value}/${yearFilter.value}`)
        .then(response => response.json())
        .then(data => {
            createSaleByProduct(data);
        })

    fetch(`/get-trends/${branchFilter.value}/${yearFilter.value}`)
        .then(response => response.json())
        .then(data => {
            createTrendsChart(data);
        })
        .catch(error => console.error('Error:', error));

    fetch(`/get-sales-map/${productFilter.value}/${branchFilter.value}/${yearFilter.value}`)
        .then(response => response.json())
        .then(data => {
            createMapsChart(data);
        })
        .catch(error => console.error('Error:', error));

    fetch(`/get-sales-chart-bygender/${branchFilter.value}/${yearFilter.value}`)
        .then(response => response.json())
        .then(data => {
            createStackedSalesChartByGender(data);
        })
        .catch(error => console.error('Error:', error));
    fetch(`/get-rates-chart-bygender/${branchFilter.value}/${yearFilter.value}`)
        .then(response => response.json())
        .then(data => {
            createRatingChartByGender(data);
        })
        .catch(error => console.error('Error:', error));

}

productFilter.addEventListener('input', updateCharts)

yearFilter.addEventListener('change', updateCharts)

branchFilter.addEventListener('change', updateCharts)

fetch("/get-products").then(response => response.json()).then(data => {
    let products = `<option value="all">All Products</option>`
    data.forEach(el => {
        products += `
        <option value="${el.item}">${el.item}</option>
        `
    })
    productFilter.innerHTML = products;
})

updateCharts();