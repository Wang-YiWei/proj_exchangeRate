// var today = new Date();　
// d3.select("#date-info").html("上次更新日期 : " + today.getFullYear() + " 年 " + (today.getMonth() + 1) + " 月 " + today.getDate() + " 日" +
//     "<br>" + today.getHours() + " 點 " + today.getMinutes() + " 分 ");

var allCountryName = [
    'USD', 'HKD', 'GBP', 'AUD', 'CAD', 'SGD', 'CHF', 'JPY', 'ZAR', 'SEK',
    'NZD', 'THB', 'PHP', 'IDR', 'EUR', 'KRW', 'VND', 'MYR', 'CNY'
];

var chineseCountryName = [
    '美金', '港幣', '英鎊', '澳幣', '加拿大幣', '新加坡幣', '瑞士法郎', '日圓', '南非幣', '瑞典幣',
    '紐元', '泰幣', '菲國比索', '印尼幣', '歐元', '韓元', '越南盾', '馬來幣', '人民幣'
];

var barchartBtnName = [
    '現金買入漲跌', '現金賣出漲跌', '即期買入漲跌', '即期賣出漲跌'
];

var allCountryColor = d3.scale.category20b();

//讀進資料
var entireHistoryData = []; //contains more than 1000 indices
var dividedCountryData = []; // contain 19 indices . Each index contains latest 3-month data. 

for (var i = 0; i < allCountryName.length; ++i) {

    //  dividedCountryData[0] contains latest 3-months of USA. dividedCountryData[1] contains latest 3-months of HKD , dividedCountryData[2].....and so on.
    dividedCountryData[i] = [];
}

var dataIsChanging = 0;
var sliceNum = 30;
var sliceNum2 = 15;
var gridInterval = 10;

d3.csv("./data/history.csv", function (tmpdata) {
    tmpdata.forEach(function (d) {
        d.x = parseInt(d.x, 10);
        d.data = new Date(d.date);
        d.historyValue1 = parseFloat(d.historyValue1);
        d.historyValue2 = parseFloat(d.historyValue2);
        d.historyValue3 = parseFloat(d.historyValue3);
        d.historyValue4 = parseFloat(d.historyValue4);
    });

    //store data to entireHistoryData[] and classify data to dividedCountryData[]
    for (var i = 0; i < tmpdata.length; ++i) {
        entireHistoryData.push(tmpdata[i]);
        for (var j = 0; j < allCountryName.length; ++j) {
            if (entireHistoryData[i].country == allCountryName[j]) {
                dividedCountryData[j].push(entireHistoryData[i]);
            }
        }
    }

    //reverse x so that the date can order from left to right
    for (var i = 0; i < allCountryName.length; ++i) {
        for (var j = 0; j < dividedCountryData[i].length; ++j) {
            dividedCountryData[i][j].x = dividedCountryData[i].length - dividedCountryData[i][j].x - 1; //i代表哪一個國家，j代表哪一天
            dividedCountryData[i][j].date = dividedCountryData[i][j].date.replace(/\//g, "-"); //turn yyyy/mm/dd to yyyy-mm-dd
        }
    }

    // 保留完整的資料
    var entireDividedCountryData = dividedCountryData.slice();

    // 創造畫布
    var linechartsvg = d3.select('#lineChart');
    var barchartSvg = d3.select("#barChart");

    function draw() {
        var whichCountry = 0;

        var linechartMargin = {
            top: 30,
            right: 50,
            bottom: 70,
            left: 50
        };
        var linechartWidth = document.getElementById("lineChartContainer").clientWidth - linechartMargin.left - linechartMargin.right;
        var linechartHeight = 500 - linechartMargin.top - linechartMargin.bottom;

        var linechartXTextSize = linechartWidth / (16 * 5);
        if(linechartXTextSize < 12) linechartXTextSize = 12;
        var linechartYTextSize = linechartMargin.left / 3;

        dividedCountryData = entireDividedCountryData.slice();

        if(linechartWidth < 1024){
            // 留部份資料
            if(linechartWidth > 400){
                gridInterval = 10;                 
                document.getElementById("page-title").innerHTML = "臺灣銀行歷史匯率-近"+ sliceNum + "筆資料走勢圖";
                for(var i = 0 ; i < allCountryName.length ; ++i){
                    dividedCountryData[i] = dividedCountryData[i].slice(0,sliceNum);
                    for(var j = 0 ; j < dividedCountryData[i].length ; ++j){
                        dividedCountryData[i][j].x -= dividedCountryData[i][sliceNum-1].x;
                    }            
                }
            }else{
                gridInterval = 5;
                // linechartMargin.right = 20;            
                document.getElementById("page-title").innerHTML = "臺灣銀行歷史匯率-近"+ sliceNum2 + "筆資料走勢圖";
                for(var i = 0 ; i < allCountryName.length ; ++i){
                    dividedCountryData[i] = dividedCountryData[i].slice(0,sliceNum2);
                    for(var j = 0 ; j < dividedCountryData[i].length ; ++j){
                        dividedCountryData[i][j].x -= dividedCountryData[i][sliceNum2-1].x;
                    }            
                }
            }
        }else{
            // 畫布大於1024，完整資料
            document.getElementById("page-title").innerHTML = "臺灣銀行最近三個月之匯率走勢圖";
            dividedCountryData = entireDividedCountryData.slice();
            gridInterval = 10;     
        }

        d3.select("#linechart-title").html(function () {
            return "目前選定 : " + chineseCountryName[whichCountry] + "<br>" + "點選按鈕觀看其他貨幣匯率";
        });

        //define max and min value.
        var minX = d3.min(dividedCountryData[whichCountry], function (d) {
                return parseInt(d.x)
            }),
            maxX = d3.max(dividedCountryData[whichCountry], function (d) {
                return parseInt(d.x)
            }),
            minY = d3.min(dividedCountryData[whichCountry], function (d) {
                if (d.historyValue1 == 0) {
                    return d.historyValue3;
                } else return d.historyValue1
            }), //value1 is always the lowest
            maxY = d3.max(dividedCountryData[whichCountry], function (d) {
                if (d.historyValue2 == 0) {
                    return d.historyValue4;
                }
                return d.historyValue2
            }); //value2 is always the highest
        
        var mindate = new Date(dividedCountryData[0][dividedCountryData[0].length - 1].date);
        var maxdate = new Date(dividedCountryData[0][0].date);

    
        linechartsvg.data(dividedCountryData[whichCountry])
            .attr({
                'width': linechartWidth + linechartMargin.left + linechartMargin.right,
                'height': linechartHeight + linechartMargin.top + linechartMargin.bottom,
            })
            .on("mousemove", linechartMove)
            .on("touchmove", linechartMove);

        //設定偏移範圍及縮放範圍
        var offsetX = linechartWidth / 10,
            offsetY = linechartHeight / 5;

        var scaleX = d3.scale.linear()
            .range([0, linechartWidth])
            .domain([0, maxX]);

        var scaleX2 = d3.time.scale()
            .range([0, linechartWidth])
            .domain([mindate, maxdate]);

        var scaleY = d3.scale.linear()
            .range([linechartHeight, 0]) //d3 Y座標是越下越大,所以反過來比較直覺
            .domain([minY, maxY]);


        //標明Y軸單位
        var yUnitText = linechartsvg.append("text")
            .attr("x", linechartMargin.left)
            .attr("y", linechartMargin.top - 15)
            .text(function (d) {
                return "(元)";
            })
            .attr("text-anchor", "end")
            .attr("font-family", "Noto Sans TC")
            .attr("font-size", "15px")
            .attr("fill", "black");

        //將縮放後的資料放進lines這個變數裡
        var lines = [4]; //4種匯率的4種折線
        for (var i = 0; i < 4; ++i) {
            lines[i] = d3.svg.line()
                .x(function (d) {
                    return scaleX(d.x);
                })
                .y(function (d) {
                    if (i == 0) return scaleY(d.historyValue1);
                    else if (i == 1) return scaleY(d.historyValue2);
                    else if (i == 2) return scaleY(d.historyValue3);
                    else if (i == 3) return scaleY(d.historyValue4);
                });
        }


        //設定座標系
        var axisX = d3.svg.axis()
            .scale(scaleX2)
            .orient("bottom") //用axis.orient 來定義座標文字的上下左右位置
            .ticks(gridInterval);

        var axisY = d3.svg.axis()
            .scale(scaleY)
            .orient("left") //用axis.orient 來定義座標文字的上下左右位置
            .ticks(gridInterval);

        var axisXGrid = d3.svg.axis()
            .scale(scaleX)
            .orient("bottom")
            .ticks(gridInterval)
            .tickFormat("")
            .tickSize(-linechartHeight, 0);

        var axisYGrid = d3.svg.axis()
            .scale(scaleY)
            .orient("left")
            .ticks(gridInterval)
            .tickFormat("")
            .tickSize(-linechartWidth, 0);

        //繪出4條折線
        var lineColor1 = '#5398D9'; //4
        var lineColor2 = '#F07995'; //1
        var lineColor3 = '#5AA382'; //3
        var lineColor4 = '#F29D4B'; //2

        //標明線段
        var beginX = linechartMargin.left,
            beginY = 0.3 * linechartMargin.top,
            lineLength = linechartWidth * 0.05,
            lineInterval = linechartWidth / 4;
        var linetextSize = 16;
        if (linechartWidth < 300) {
            linetextSize = 9;
        } else if (linechartWidth < 500) {
            linetextSize = 12;
        }
        for (var i = 0; i < 4; ++i) {
            linechartsvg.append("line") // attach a line
                .style("stroke", function () {
                    if (i == 0) return lineColor1;
                    else if (i == 1) return lineColor2;
                    else if (i == 2) return lineColor3;
                    else if (i == 3) return lineColor4;

                })
                .style("stroke-width", 2.5)
                .attr("x1", beginX + i * lineInterval)
                .attr("y1", beginY)
                .attr("x2", beginX + lineLength + i * lineInterval)
                .attr("y2", beginY);
            linechartsvg.append("circle")
                .attr("cx", function () {
                    return beginX + 0.5 * lineLength + i * lineInterval;
                })
                .attr("cy", beginY)
                .attr("r", function () {
                    if (linechartWidth < 400) return 3;
                    else return 5;
                })
                .attr("fill", function () {
                    if (i == 0) return lineColor1;
                    else if (i == 1) return lineColor2;
                    else if (i == 2) return lineColor3;
                    else if (i == 3) return lineColor4;
                })
            linechartsvg.append("text")
                .attr("x", function () {
                    return (beginX + lineLength) + 5 + i * lineInterval;
                })
                .attr("y", 0.3 * linechartMargin.top + 0.5 * linetextSize)
                .text(function () {
                    if (i == 0) return "現金買入";
                    else if (i == 1) return "現金賣出";
                    else if (i == 2) return "即期買入";
                    else if (i == 3) return "即期賣出";
                })
                .attr("text-anchor", "start")
                .attr("font-family", "Noto Sans TC")
                .attr("font-size", linetextSize + "px")
                .attr("fill", function () {
                    if (i == 0) return lineColor1;
                    else if (i == 1) return lineColor2;
                    else if (i == 2) return lineColor3;
                    else if (i == 3) return lineColor4;
                });
        }


        for (var i = 0; i < 4; ++i) {
            linechartsvg.append('path')
                .attr("class", "historylines" + i)
                .attr({
                    'd': lines[i](dividedCountryData[whichCountry]),
                    'stroke': function (d) {
                        if (i == 0) return lineColor1;
                        else if (i == 1) return lineColor2;
                        else if (i == 2) return lineColor3;
                        else if (i == 3) return lineColor4;
                    },
                    'transform': 'translate(' + (linechartMargin.left) + ', ' + (linechartMargin.top) + ')', //用translate挑整axisX,axisY的位置
                    'fill': 'none'
                });
        }


        //繪出X軸標格
        linechartsvg.append('g')
            .call(axisXGrid)
            .attr({
                'fill': 'none',
                'stroke': 'rgba(170,170,170,0.15)',
                'transform': 'translate(' + (linechartMargin.left) + ', ' + (linechartHeight + linechartMargin.top) + ')'
            });
        //繪出Y軸標格
        linechartsvg.append('g')
            .call(axisYGrid)
            .attr({
                'fill': 'none',
                'stroke': 'rgba(170,170,170,0.15)',
                'transform': 'translate(' + (linechartMargin.left) + ',' + (linechartMargin.top) + ')'
            });
        //繪出X軸
        linechartsvg.append('g')
            .call(axisX) //call axisX
            .attr({
                'class': 'axisX',
                'fill': 'none',
                'stroke': 'rgba(170,170,170,0.4)',
                'transform': 'translate(' + (linechartMargin.left) + ', ' + (linechartHeight + linechartMargin.top) + ')' //用translate挑整axisX,axisY的位置
            })
            .selectAll('text')
            .attr({
                'fill': '#000',
                'stroke': 'none',
            }).style({
                'font-size': linechartXTextSize
            });
        //繪出Y軸
        linechartsvg.append('g')
            .call(axisY) //call axisY
            .attr({
                'class': 'axisY',
                'fill': 'none',
                'stroke': 'rgba(170,170,170,0.15)',
                'transform': 'translate(' + (linechartMargin.left) + ',' + (linechartMargin.top) + ')' //用translate挑整axisX,axisY的位置
            })
            .selectAll('text')
            .attr({
                'class': 'linechartYtext',
                'fill': '#000',
                'stroke': 'none',
            }).style({
                'font-size': linechartYTextSize
            });

        //繪出跟著滑鼠跑的線
        var flexibleLineColor = '#6465A5';
        linechartsvg.append('line')
            .attr('id', 'flexibleLine')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', 0)
            .style('stroke', flexibleLineColor)
            .style('stroke-width', 4)
            .style('opacity', 0);

        //創造資料的圓點並繪出
        var originR = 3.5,
            bigR = 6;
        var dots = [4]; //store 4 kind of value's array.
        var dotName = ['dots1', 'dots2', 'dots3', 'dots4']
        for (var j = 0; j < 4; ++j) {
            dots[j] = linechartsvg.selectAll(dotName[j])
                .data(dividedCountryData[whichCountry])
                .enter()
                .append('g')
                .append('circle')
                .attr('class', function (d, i) {
                    return "dots" + i + " onLine" + j;
                })
                .attr('cx', function (d) {
                    return scaleX(d.x) + linechartMargin.left;
                })
                .attr('cy', function (d) {
                    if (j == 0) return scaleY(d.historyValue1) + linechartMargin.top;
                    else if (j == 1) return scaleY(d.historyValue2) + linechartMargin.top;
                    else if (j == 2) return scaleY(d.historyValue3) + linechartMargin.top;
                    else if (j == 3) return scaleY(d.historyValue4) + linechartMargin.top;
                })
                .attr('fill', function (d) {
                    if (j == 0) return lineColor1;
                    else if (j == 1) return lineColor2;
                    else if (j == 2) return lineColor3;
                    else if (j == 3) return lineColor4;
                })
                .attr('r', originR);
        }

        //繪出圓點資訊
        var shineDuration = 400;
        var dotTextOffsetX = 60,
            dotTextOffsetY = 40;
        var tips = linechartsvg.append('g')
            .attr('class', 'tips');
        var infoWidth = 200,
            infoHeight = 120;
        tips.append('rect')
            .attr('class', 'tips-border')
            .attr('width', infoWidth)
            .attr('height', infoHeight)
            .attr('rx', 10)
            .attr('ry', 10)
            .attr("stroke", flexibleLineColor)
            .attr("stroke-width", '2px')
            .attr('fill', '#CCCCFF')
            .attr('opacity', 0);



        var infoTextOffsetX = 10;
        var tipText = [];
        for (var i = 0; i < 5; ++i) {
            tipText[i] = "tips-text" + i;
        }
        for (var j = 0; j < 5; ++j) {
            tips.append('text')
                .attr('class', tipText[j])
                .attr('dx', infoTextOffsetX)
                .attr('dy', function () {
                    return 20 * (j + 1)
                })
                .text("")
                .attr('font-family', 'Noto Sans TC');
        }

        //跟著滑鼠跑的那條線的Function
        var dotIsShining = 0; //判斷是否有某資料點正在閃爍
        var shineDistance = 7;

        function linechartMove(d, i) {
            if (dataIsChanging == 0) {
                mousePosOnLinechart = d3.mouse(this);

                //show data
                for (var i = 0; i < dividedCountryData[whichCountry].length; ++i) {
                    if (Math.abs(mousePosOnLinechart[0] - (scaleX(dividedCountryData[whichCountry][i].x) + linechartMargin.left)) < shineDistance) {
                        dotIsShining++;

                        //讓點反覆閃爍
                        d3.selectAll(".dots" + i)
                            .attr({
                                'fill': flexibleLineColor
                            })
                            .transition()
                            .duration(shineDuration)
                            .attr("r", bigR)
                            .each("start", function repeat() {
                                d3.select(this)
                                    .attr('r', originR)
                                    .transition()
                                    .duration(shineDuration)
                                    .attr("r", bigR)
                                    .transition()
                                    .duration(shineDuration)
                                    .attr("r", originR)
                                    .transition()
                                    .each("start", repeat);
                            });

                        //顯示資料塊
                        d3.select('.tips-border')
                            .transition()
                            .delay(10)
                            .attr('opacity', 0.4)
                            .attr("x", function () {
                                if (i < 0.5 * dividedCountryData[whichCountry].length) return (scaleX(dividedCountryData[whichCountry][i].x) + linechartMargin.left) - infoWidth;
                                else return (scaleX(dividedCountryData[whichCountry][i].x) + linechartMargin.left);
                            })
                            .attr("y", function () {
                                if (dividedCountryData[whichCountry][0].historyValue2 == 0) {
                                    return (scaleY(dividedCountryData[whichCountry][i].historyValue4) + linechartMargin.top);
                                }
                                return (scaleY(dividedCountryData[whichCountry][i].historyValue2) + linechartMargin.top);
                            });
                        //顯示資料塊裡的文字
                        for (var j = 0; j < 5; ++j) {
                            d3.select('.' + tipText[j])
                                .transition()
                                .delay(10)
                                .attr("opacity", 1)
                                .attr("x", function () {
                                    if (i < 0.5 * dividedCountryData[whichCountry].length) return (scaleX(dividedCountryData[whichCountry][i].x) + linechartMargin.left) - infoWidth;
                                    else return (scaleX(dividedCountryData[whichCountry][i].x) + linechartMargin.left);
                                })
                                .attr("y", function () {
                                    if (dividedCountryData[whichCountry][0].historyValue2 == 0) {
                                        return (scaleY(dividedCountryData[whichCountry][i].historyValue4) + linechartMargin.top);
                                    }
                                    return (scaleY(dividedCountryData[whichCountry][i].historyValue2) + linechartMargin.top);
                                })
                                .text(function (d) {
                                    if (j == 0) return dividedCountryData[whichCountry][i].date + "(" + chineseCountryName[whichCountry] + dividedCountryData[whichCountry][i].country + ")";
                                    else if (j == 1) return "現金買入 : " + dividedCountryData[whichCountry][i].historyValue1 + "元";
                                    else if (j == 2) return "現金賣出 : " + dividedCountryData[whichCountry][i].historyValue2 + "元";
                                    else if (j == 3) return "即期買入 : " + dividedCountryData[whichCountry][i].historyValue3 + "元";
                                    else if (j == 4) return "即期賣出 : " + dividedCountryData[whichCountry][i].historyValue4 + "元";
                                });
                        }
                    } else if (dotIsShining != 0) { //當有某資料點正在閃爍且滑鼠離該資料點的x軸距離大於10的時候
                        //讓閃爍的點恢復成原來的樣子
                        //透過filter篩選class裡的class，還原正確的顏色
                        d3.selectAll(".dots" + i)
                            .filter(".onLine0")
                            .attr('fill', function (d) {
                                return lineColor1;
                            });
                        d3.selectAll(".dots" + i)
                            .filter(".onLine1")
                            .attr('fill', function (d) {
                                return lineColor2;
                            });
                        d3.selectAll(".dots" + i)
                            .filter(".onLine2")
                            .attr('fill', function (d) {
                                return lineColor3;
                            });
                        d3.selectAll(".dots" + i)
                            .filter(".onLine3")
                            .attr('fill', function (d) {
                                return lineColor4;
                            });
                        d3.selectAll('.dots' + i)
                            .transition() //要是沒有這兩行，
                            .duration(shineDuration) //就算直接指定半徑恢復成圓半徑，還是看不見效果
                            .attr('r', originR);
                    }

                }
                //設定跟著滑鼠跑的那條線從長度從y = 0 到畫布的最底
                d3.select('#flexibleLine')
                    .style('opacity', function () {
                        if (mousePosOnLinechart[0] > (scaleX(dividedCountryData[whichCountry][0].x) + linechartMargin.left) + 10)
                            return 0;
                        if (mousePosOnLinechart[0] < scaleX(dividedCountryData[whichCountry][dividedCountryData[whichCountry].length - 1].x) + linechartMargin.left)
                            return 0;
                        return 1;
                    })
                    .transition()
                    .duration(5)
                    .attr('x1', mousePosOnLinechart[0])
                    .attr('y1', 0 + linechartMargin.top)
                    .attr('x2', mousePosOnLinechart[0])
                    .attr('y2', mousePosOnLinechart[1] + (linechartHeight - mousePosOnLinechart[1] + linechartMargin.top));
            }

        }

        // 為button做美化
        // d3.selectAll(".menu")
        //     .style("border", function (d, i) {
        //         return "2px solid" + allCountryColor(i);
        //     })
        //     .style("background-color", function (d, i) {
        //         return allCountryColor(i);
        //     });

        //換資料
        var dataChangingTime = 750;

        function updateData() {
            d3.select("#linechart-title").html(function () {
                return "目前選定 : " + chineseCountryName[whichCountry] + "<br>" + "點選按鈕觀看其他貨幣匯率";
            });
            dataIsChanging = 1;

            linechartYTextSize = (whichCountry == 13 || whichCountry == 15 || whichCountry == 16) ?
                linechartMargin.left / 4 : linechartMargin.left / 3;

            //重新定義一些資料
            minX = d3.min(dividedCountryData[whichCountry], function (d) {
                return parseInt(d.x)
            });
            maxX = d3.max(dividedCountryData[whichCountry], function (d) {
                return parseInt(d.x)
            });
            minY = d3.min(dividedCountryData[whichCountry], function (d) {
                    if (d.historyValue1 == 0) {
                        return d.historyValue3;
                    } else return d.historyValue1
                }), //value1 is always the lowest
                maxY = d3.max(dividedCountryData[whichCountry], function (d) {
                    if (d.historyValue2 == 0) {
                        return d.historyValue4;
                    }
                    return d.historyValue2
                }); //value2 is always the highest

            mindate = new Date(dividedCountryData[0][dividedCountryData[0].length - 1].date);
            maxdate = new Date(dividedCountryData[0][0].date);

            scaleY = d3.scale.linear()
                .range([linechartHeight, 0]) //d3 Y座標是越下越大,所以反過來比較直覺
                .domain([minY, maxY]);

            axisY = d3.svg.axis()
                .scale(scaleY)
                .orient("left") //用axis.orient 來定義座標文字的上下左右位置
                .ticks(gridInterval);

            for (var i = 0; i < 4; ++i) {
                lines[i] = d3.svg.line()
                    .x(function (d) {
                        return scaleX(d.x);
                    })
                    .y(function (d) {
                        if (i == 0) return scaleY(d.historyValue1);
                        else if (i == 1) return scaleY(d.historyValue2);
                        else if (i == 2) return scaleY(d.historyValue3);
                        else if (i == 3) return scaleY(d.historyValue4);
                    });
            }

            //做改變
            //更改折線位址
            for (var i = 0; i < 4; ++i) {
                d3.select("body")
                    .transition()
                    .select(".historylines" + i) // change the line
                    .duration(dataChangingTime)
                    .attr("d", lines[i](dividedCountryData[whichCountry]));
            }

            //更改點的位址
            for (var i = 0; i < dividedCountryData[whichCountry].length; ++i) {
                for (var j = 0; j < 4; ++j) {
                    d3.select("body")
                        .transition()
                        .select(".dots" + i + ".onLine" + j)
                        .duration(dataChangingTime)
                        .attr('cx', function (d) {
                            return scaleX(dividedCountryData[whichCountry][i].x) + linechartMargin.left;
                        })
                        .attr('cy', function (d) {
                            if (j == 0) return scaleY(dividedCountryData[whichCountry][i].historyValue1) + linechartMargin.top;
                            else if (j == 1) return scaleY(dividedCountryData[whichCountry][i].historyValue2) + linechartMargin.top;
                            else if (j == 2) return scaleY(dividedCountryData[whichCountry][i].historyValue3) + linechartMargin.top;
                            else if (j == 3) return scaleY(dividedCountryData[whichCountry][i].historyValue4) + linechartMargin.top;
                        });
                }

            }

            //更改Y軸
            d3.select("body")
                .transition()
                .select(".axisY") // change the y axis
                .duration(dataChangingTime)
                .call(axisY)
                .selectAll('text')
                .attr({
                    'class': 'linechartYtext',
                    'fill': '#000',
                    'stroke': 'none',
                }).style({
                    'font-size': linechartYTextSize
                });

            //當在更換資料時，不能進行其他mouseEvent
            setTimeout(function () {
                dataIsChanging = 0;
            }, dataChangingTime + 50);

        } //updateData();

        var MenuActive;
        d3.selectAll(".menu")
            .on("click", function () {
                //update active class

                MenuActive = document.getElementsByClassName("menu active");
                MenuActive[0].className = "menu";
                this.className += " active ";
                for (var i = 0; i < allCountryName.length; ++i) {
                    if (this.id.split("btn")[1] == allCountryName[i]) {
                        whichCountry = i;
                    }
                }
                updateData();
            })


        /* --- Bar chart --- */

        /* arrange data for bar chart */
        var PoscashBuyChange = [],
            PoscashSellChange = [],
            PosSightBuyChange = [],
            PosSightSellChange = [],
            NegcashBuyChange = [],
            NegcashSellChange = [],
            NegSightBuyChange = [],
            NegSightSellChange = [];

        var cashBuyChange = [],
            cashSellChange = [],
            sightBuyChange = [],
            sightSellChange = [];


        for (var i = 0; i < allCountryName.length; ++i) {
            if (dividedCountryData[i][1].historyValue1 != 0 && (dividedCountryData[i][0].historyValue1 - dividedCountryData[i][1].historyValue1) != 0) {
                if ((dividedCountryData[i][0].historyValue1 - dividedCountryData[i][1].historyValue1) / dividedCountryData[i][1].historyValue1 > 0) {
                    PoscashBuyChange.push({
                        country: allCountryName[i],
                        changeValue: parseFloat((parseFloat((dividedCountryData[i][0].historyValue1 - dividedCountryData[i][1].historyValue1) * 100 / dividedCountryData[i][1].historyValue1)).toFixed(2))
                    });
                } else {
                    NegcashBuyChange.push({
                        country: allCountryName[i],
                        changeValue: parseFloat((parseFloat(Math.abs((dividedCountryData[i][0].historyValue1 - dividedCountryData[i][1].historyValue1) * 100 / dividedCountryData[i][1].historyValue1))).toFixed(2))
                    });
                }
                cashBuyChange.push({
                    country: allCountryName[i],
                    changeValue: parseFloat((parseFloat((dividedCountryData[i][0].historyValue1 - dividedCountryData[i][1].historyValue1) * 100 / dividedCountryData[i][1].historyValue1)).toFixed(2))
                });
            }
            if (dividedCountryData[i][1].historyValue2 != 0 && (dividedCountryData[i][0].historyValue2 - dividedCountryData[i][1].historyValue2) != 0) {
                if ((dividedCountryData[i][0].historyValue2 - dividedCountryData[i][1].historyValue2) / dividedCountryData[i][1].historyValue2 > 0) {
                    PoscashSellChange.push({
                        country: allCountryName[i],
                        changeValue: parseFloat((parseFloat((dividedCountryData[i][0].historyValue2 - dividedCountryData[i][1].historyValue2) * 100 / dividedCountryData[i][1].historyValue2)).toFixed(2))
                    });
                } else {
                    NegcashSellChange.push({
                        country: allCountryName[i],
                        changeValue: parseFloat((parseFloat(Math.abs((dividedCountryData[i][0].historyValue2 - dividedCountryData[i][1].historyValue2) * 100 / dividedCountryData[i][1].historyValue2))).toFixed(2))
                    });
                }
                cashSellChange.push({
                    country: allCountryName[i],
                    changeValue: parseFloat((parseFloat((dividedCountryData[i][0].historyValue2 - dividedCountryData[i][1].historyValue2) * 100 / dividedCountryData[i][1].historyValue2)).toFixed(2))
                });
            }
            if (dividedCountryData[i][1].historyValue3 != 0 && (dividedCountryData[i][0].historyValue3 - dividedCountryData[i][1].historyValue3) != 0) {
                if ((dividedCountryData[i][0].historyValue3 - dividedCountryData[i][1].historyValue3) / dividedCountryData[i][1].historyValue3 > 0) {
                    PosSightBuyChange.push({
                        country: allCountryName[i],
                        changeValue: parseFloat((parseFloat((dividedCountryData[i][0].historyValue3 - dividedCountryData[i][1].historyValue3) * 100 / dividedCountryData[i][1].historyValue3)).toFixed(2))
                    });
                } else {
                    NegSightBuyChange.push({
                        country: allCountryName[i],
                        changeValue: parseFloat((parseFloat(Math.abs((dividedCountryData[i][0].historyValue3 - dividedCountryData[i][1].historyValue3) * 100 / dividedCountryData[i][1].historyValue3))).toFixed(2))
                    });
                }
                sightBuyChange.push({
                    country: allCountryName[i],
                    changeValue: parseFloat((parseFloat((dividedCountryData[i][0].historyValue3 - dividedCountryData[i][1].historyValue3) * 100 / dividedCountryData[i][1].historyValue3)).toFixed(2))
                });
            }
            if (dividedCountryData[i][1].historyValue4 != 0 && (dividedCountryData[i][0].historyValue4 - dividedCountryData[i][1].historyValue4) != 0) {
                if ((dividedCountryData[i][0].historyValue4 - dividedCountryData[i][1].historyValue4) / dividedCountryData[i][1].historyValue4 > 0) {
                    PosSightSellChange.push({
                        country: allCountryName[i],
                        changeValue: parseFloat((parseFloat((dividedCountryData[i][0].historyValue4 - dividedCountryData[i][1].historyValue4) * 100 / dividedCountryData[i][1].historyValue4)).toFixed(2))
                    });
                } else {
                    NegSightSellChange.push({
                        country: allCountryName[i],
                        changeValue: parseFloat((parseFloat(Math.abs((dividedCountryData[i][0].historyValue4 - dividedCountryData[i][1].historyValue4) * 100 / dividedCountryData[i][1].historyValue4))).toFixed(2))
                    });
                }
                sightSellChange.push({
                    country: allCountryName[i],
                    changeValue: parseFloat((parseFloat((dividedCountryData[i][0].historyValue4 - dividedCountryData[i][1].historyValue4) * 100 / dividedCountryData[i][1].historyValue4)).toFixed(2))
                });
            }
        }

        var whichBtn = 0;

        var PosNum = 0,
            NegNum = 0;

        var allKindOfRate = [cashBuyChange, cashSellChange, sightBuyChange, sightSellChange];

        d3.select("#barchart-title").html(function () {
            return "目前選定 : " + barchartBtnName[whichBtn] + "<br>" + "點選按鈕觀看其他牌告利率";
        });

        for (var i = 0; i < 4; ++i) {
            allKindOfRate[i].sort(function (x, y) {
                return d3.descending(x.changeValue, y.changeValue);
            });
        }

        for (var i = 0; i < allKindOfRate[whichBtn].length; ++i) {
            if (allKindOfRate[whichBtn][i].changeValue > 0) PosNum++;
            else NegNum++;
        }

        /* Create gradient color */
        var deepColor1 = "steelblue",
            lightColor1 = "#D5EEFF",
            deepColor2 = "#F67280",
            lightColor2 = "#FFFDE1";

        var countryPosColor = d3.scale
            .linear()
            .domain([0, PosNum])
            .range([deepColor1, lightColor1]); //由深到淺
        var countryNegColor = d3.scale
            .linear()
            .domain([0, NegNum])
            .range([lightColor2, deepColor2]);

        var axisColor = "#6E6E6E";

        /* Start to draw */
        var barchartMargin = {
            top: 50,
            right: 20,
            bottom: 100,
            left: 100
        };
        var barchartWidth = document.getElementById("barChartContainer").clientWidth * 0.95 - barchartMargin.left - barchartMargin.right;
        var barchartHeight = 600 - barchartMargin.top - barchartMargin.bottom;

        barchartSvg.attr("width", barchartWidth + barchartMargin.left + barchartMargin.right)
            .attr("height", barchartHeight + barchartMargin.top + barchartMargin.bottom)
            .append("g");

        var barchartScaleX = d3.scale.ordinal().rangeRoundBands([0, barchartWidth], 0.1).domain(allKindOfRate[whichBtn].map(function (d) {
            return d.country;
        }));
        var barchartScaleY = d3.scale.linear().range([barchartHeight, 0]).domain(d3.extent(allKindOfRate[whichBtn], function (d) {
            return parseFloat(d.changeValue);
        }));

        var barchartScaleXAxis = d3.svg.axis()
            .scale(barchartScaleX)
            .orient("bottom")
            .ticks(10);

        var barchartScaleYAxis = d3.svg.axis()
            .scale(barchartScaleY)
            .orient("left")
            .ticks(10)
            .tickFormat(function (d) {
                return parseFloat(parseFloat(d).toFixed(2)) + '%';
            });

        var barchartTip = d3.tip()
            .attr('class', 'barchart-d3-tip')
            .offset([-10, 0])
            .html(function (d) {
                if (d.changeValue < 0)
                    return d.country + " : <span style='color:#FF7777'>" + d.changeValue + "</span> %";
                else
                    return d.country + " : <span style='color:steelblue'>" + d.changeValue + "</span> %";
            });

        barchartSvg.call(barchartTip);


        var barRect = barchartSvg.selectAll(".barRect")
            .data(allKindOfRate[whichBtn]);

        barRect.enter().append("rect")
            .attr("transform",
                "translate(" + barchartMargin.left + "," + barchartMargin.top + ")")
            .style("fill", function (d, i) {
                if (d.changeValue > 0) {
                    return countryPosColor(i);
                } else return countryNegColor(i - PosNum + 1);
            })
            .attr("class", "barRect")
            .attr("x", function (d) {
                return barchartScaleX(d.country);
            })
            .attr("width", barchartScaleX.rangeBand())
            .attr("y", function (d) {
                if (d.changeValue > 0) return barchartScaleY(0) - (Math.abs(barchartScaleY(d.changeValue) - barchartScaleY(0)));
                else return barchartScaleY(0);
            })
            .attr("height", function (d) {
                return Math.abs(barchartScaleY(d.changeValue) - barchartScaleY(0))
            })
            .on('mouseover', barchartTip.show)
            .on('mouseout', barchartTip.hide);

        var originAxisX = barchartScaleY(0);
        var allTick = barchartSvg.append("g")
            .attr("transform",
                "translate(" + barchartMargin.left + "," + (barchartMargin.top + barchartScaleY(0)) + ")")
            .attr("class", "barchartScaleXAxis")
            .style("z-index", 100)
            .call(barchartScaleXAxis)
            .attr('fill', 'none')
            .attr('stroke', function (d) {
                //tick顏色
                return axisColor;
            });

        allTick.selectAll('text')
            .data(allKindOfRate[whichBtn])
            .attr('stroke', 'none')
            .attr('fill', function (d) {
                return axisColor;
            });

        var tickNegative = allTick.selectAll('.tick')
            .attr("class", "tickNegative")
            .style("z-index", 100)
            .filter(function (d, i) {
                return allKindOfRate[whichBtn][i].changeValue < 0;
            });

        tickNegative.select('line')
            .style("z-index", 100)
            .attr('y2', -6);

        tickNegative.select('text')
            .transition()
            .duration(dataChangingTime)
            .attr("dy", "-1.3em")
            .attr("stroke", function (d, i) {
                return 'none';
            })
            .attr("fill", function (d, i) {
                return axisColor;
            });

        barchartSvg.append("g")
            .attr("transform",
                "translate(" + barchartMargin.left + "," + barchartMargin.top + ")")
            .attr("class", "barchartScaleYAxis")
            .call(barchartScaleYAxis)
            .attr({
                'fill': 'none',
                'stroke': axisColor
            })
            .selectAll("text")
            .attr({
                'fill': axisColor,
                'stroke': 'none'
            })
            .style("text-anchor", "end");

        var buttonActive2;
        d3.selectAll(".change-btn")
            // .style("background-color", function () {
            //     return "orange";
            // })
            .on("click", function () {
                for (var i = 0; i < 4; ++i) {
                    if (this.id.split("button")[1][0] == i) {
                        whichBtn = i;
                        buttonActive2 = document.getElementsByClassName("change-btn active");
                        buttonActive2[0].className = "change-btn";
                        this.className += " active ";
                    }
                }
                updateData2();
            });

        function updateData2() {


            d3.select("#barchart-title").html(function () {
                return "目前選定 : " + barchartBtnName[whichBtn] + "<br>" + "點選按鈕觀看其他牌告利率";
            });

            PosNum = 0;
            NegNum = 0;
            for (var i = 0; i < allKindOfRate[whichBtn].length; ++i) {
                if (allKindOfRate[whichBtn][i].changeValue > 0) PosNum++;
                else NegNum++;
            }

            countryPosColor = d3.scale
                .linear()
                .domain([0, PosNum])
                .range([deepColor1, lightColor1]); //由深到淺
            countryNegColor = d3.scale
                .linear()
                .domain([0, NegNum])
                .range([lightColor2, deepColor2]);

            //重新定義一些資料
            barchartScaleX = d3.scale.ordinal().rangeRoundBands([0, barchartWidth], 0.1).domain(allKindOfRate[whichBtn].map(function (d) {
                return d.country;
            }));
            barchartScaleY = d3.scale.linear().range([barchartHeight, 0]).domain(d3.extent(allKindOfRate[whichBtn], function (d) {
                return parseFloat(d.changeValue);
            }));

            //更改X,Y軸
            barchartScaleXAxis = d3.svg.axis()
                .scale(barchartScaleX)
                .orient("bottom")
                .ticks(10);

            barchartScaleYAxis = d3.svg.axis()
                .scale(barchartScaleY)
                .orient("left")
                .ticks(10)
                .tickFormat(function (d, i) {
                    return parseFloat(parseFloat(d).toFixed(2)) + '%';
                });

            // 移除多餘的bar
            var barRect1 = barchartSvg.selectAll(".barRect")
                .data(allKindOfRate[whichBtn]);
            barRect1.transition()
                .duration(dataChangingTime)
                .style("fill", function (d, i) {
                    if (d.changeValue > 0) {
                        return countryPosColor(i);
                    } else return countryNegColor(i - PosNum + 1);
                })
                .attr("class", "barRect")
                .attr("x", function (d) {
                    return barchartScaleX(d.country);
                })
                .attr("width", barchartScaleX.rangeBand())
                .attr("y", function (d) {
                    if (d.changeValue > 0) return barchartScaleY(0) - (Math.abs(barchartScaleY(d.changeValue) - barchartScaleY(0)));
                    else return barchartScaleY(0);
                })
                .attr("height", function (d) {
                    return Math.abs(barchartScaleY(d.changeValue) - barchartScaleY(0));
                });

            barRect1.exit()
                .transition()
                .duration(dataChangingTime)
                .attr('opacity', 0).remove();

            // 增加新bar            
            var barRect2 = barchartSvg.selectAll(".barRect")
                .data(allKindOfRate[whichBtn]);

            barRect2.enter().append("rect")
                .attr("transform",
                    "translate(" + barchartMargin.left + "," + barchartMargin.top + ")");

            barRect2.transition()
                .duration(dataChangingTime)
                .attr("transform",
                    "translate(" + barchartMargin.left + "," + barchartMargin.top + ")")
                .style("fill", function (d, i) {
                    if (d.changeValue > 0) {
                        return countryPosColor(i);
                    } else return countryNegColor(i - PosNum + 1);
                })
                .style("z-index", -10)
                .attr("class", "barRect")
                .attr("x", function (d) {
                    return barchartScaleX(d.country);
                })
                .attr("width", barchartScaleX.rangeBand())
                .attr("y", function (d) {
                    if (d.changeValue > 0) return barchartScaleY(0) - (Math.abs(barchartScaleY(d.changeValue) - barchartScaleY(0)));
                    else return barchartScaleY(0);
                })
                .attr("height", function (d) {
                    return Math.abs(barchartScaleY(d.changeValue) - barchartScaleY(0));
                });

            // Y軸漸變
            d3.select("body")
                .transition()
                .select(".barchartScaleYAxis") // change the y axis
                .duration(dataChangingTime)
                .call(barchartScaleYAxis)
                .attr({
                    'fill': 'none',
                    'stroke': axisColor
                })
                .selectAll("text")
                .attr({
                    'fill': axisColor,
                    'stroke': 'none'
                })
                .style("text-anchor", "end");

            // x軸重新繪出
            d3.select(".barchartScaleXAxis").remove();
            allTick = barchartSvg.append("g")
                .attr("transform",
                    "translate(" + barchartMargin.left + "," + (barchartMargin.top + originAxisX) + ")")
                .attr("class", "barchartScaleXAxis")
                .attr({
                    'fill': 'none',
                    'stroke': axisColor //tick顏色
                })
                .transition()
                .duration(dataChangingTime)
                .call(barchartScaleXAxis)
                .attr("transform",
                    "translate(" + barchartMargin.left + "," + (barchartMargin.top + barchartScaleY(0)) + ")");

            originAxisX = barchartScaleY(0);

            allTick.selectAll("text")
                .attr({
                    'fill': axisColor,
                    'stroke': 'none'
                });

            tickNegative = allTick.selectAll('.tick')
                .attr("class", "tickNegative")
                .filter(function (d, i) {
                    return allKindOfRate[whichBtn][i].changeValue < 0;
                });

            tickNegative.select('line')
                .attr('y2', -6);


            tickNegative.select('text')
                .attr("dy", "-1.3em")
                .attr("stroke", function (d, i) {
                    return 'none';
                })
                .attr("fill", function (d, i) {
                    return axisColor;
                });

        } //updateData2();

    }

    draw();

    // window.addEventListener("resize", function () {
    //     linechartsvg.selectAll("g").remove();
    //     linechartsvg.selectAll("path").remove();
    //     linechartsvg.selectAll("text").remove();
    //     linechartsvg.selectAll("line").remove();
    //     linechartsvg.selectAll("circle").remove();

    //     barchartSvg.selectAll("g").remove();
    //     barchartSvg.selectAll("rect").remove();
    //     barchartSvg.selectAll("text").remove();

    //     draw();
    // });

}) //d3.csv