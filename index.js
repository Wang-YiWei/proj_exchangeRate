var allCountryName = [
    'USD', 'HKD', 'GBP', 'AUD', 'CAD', 'SGD', 'CHF', 'JPY', 'ZAR', 'SEK',
    'NZD', 'THB', 'PHP', 'IDR', 'EUR', 'KRW', 'VND', 'MYR', 'CNY'
]
var chineseCountryName = [
        '美金', '港幣', '英鎊', '澳幣', '加拿大幣', '新加坡幣', '瑞士法郎', '日圓', '南非幣', '瑞典幣',
        '紐元', '泰幣', '菲國比索', '印尼幣', '歐元', '韓元', '越南盾', '馬來幣', '人民幣'
    ]
    //讀進資料
var entireHistoryData = []; //contains more than 1000 indices
var dividedCountryData = []; // contain 19 indices . Each index contains latest 3-month data. 

for (var i = 0; i < allCountryName.length; ++i) {
    //  dividedCountryData[0] contains latest 3-months of USA. dividedCountryData[1] contains latest 3-months of HKD , dividedCountryData[2].....and so on.
    dividedCountryData[i] = [];
}

var dataIsChanging = 0;

d3.csv("history.csv", function(tmpdata) {
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
                //console.log(dividedCountryData[i][j].x);
            }
        }
        var whichCountry = 0;

        // var linechartWidth = screen.availWidth - $('.container1').width() - 30,
        //     linechartHeight = $('.container1').height();
        //$('#lineChart').height(screen.availHeight);

        var linechartMargin = { top: 30, right: 50, bottom: 70, left: 50 };

        var linechartWidth = 0.9 * $('.col-lg-9').width() - linechartMargin.left - linechartMargin.right;
        var linechartHeight = 0.6 * $('.col-lg-9').width() - linechartMargin.top - linechartMargin.bottom;

        //define max and min value.
        var minX = d3.min(dividedCountryData[whichCountry], function(d) { return parseInt(d.x) }),
            maxX = d3.max(dividedCountryData[whichCountry], function(d) { return parseInt(d.x) }),
            minY = d3.min(dividedCountryData[whichCountry], function(d) {
                if (d.historyValue1 == 0) {
                    return d.historyValue3;
                } else return d.historyValue1
            }), //value1 is always the lowest
            maxY = d3.max(dividedCountryData[whichCountry], function(d) {
                if (d.historyValue2 == 0) {
                    return d.historyValue4;
                }
                return d.historyValue2
            }); //value2 is always the highest

        var mindate = new Date(dividedCountryData[0][dividedCountryData[0].length - 1].date),
            maxdate = new Date(dividedCountryData[0][0].date);

        //創造畫布
        var linechartsvg = d3.select('.container2')
            .append('svg')
            .attr('id', 's');

        linechartsvg.data(dividedCountryData[whichCountry])
            .attr({
                'width': linechartWidth + linechartMargin.left + linechartMargin.right,
                'height': linechartHeight + linechartMargin.top + linechartMargin.bottom,
            }).style({
                // 'border': '1px solid #000'
                // 'background':rgba(170,170,170,0.15)
            })
            .attr('transform', 'translate(' + linechartMargin.left + ',' + linechartMargin.top + ')')
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

        //標明圖形主題
        var lineChartTopic = linechartsvg.append("text")
            .attr("x", 0.5 * linechartWidth)
            .attr("y", linechartHeight + linechartMargin.bottom)
            .text(function(d) { return "臺灣銀行最近三個月之匯率走勢圖"; })
            .attr("text-anchor", "middle")
            .attr("font-family", "Noto Sans TC")
            .attr("font-size", "20px")
            .attr("fill", "black");



        //將縮放後的資料放進lines這個變數裡
        var lines = [4]; //4種匯率的4種折線
        for (var i = 0; i < 4; ++i) {
            lines[i] = d3.svg.line()
                .x(function(d) { return scaleX(d.x); })
                .y(function(d) {
                    if (i == 0) return scaleY(d.historyValue1);
                    else if (i == 1) return scaleY(d.historyValue2);
                    else if (i == 2) return scaleY(d.historyValue3);
                    else if (i == 3) return scaleY(d.historyValue4);
                });
        }


        //設定座標系
        var gridInterval = 10;

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
                .style("stroke", function() {
                    if (i == 0) return lineColor1;
                    if (i == 1) return lineColor2;
                    if (i == 2) return lineColor3;
                    if (i == 3) return lineColor4;

                })
                .style("stroke-width", 2.5)
                .attr("x1", beginX + i * lineInterval)
                .attr("y1", beginY)
                .attr("x2", beginX + lineLength + i * lineInterval)
                .attr("y2", beginY);
            linechartsvg.append("circle")
                .attr("cx", function() {
                    return beginX + 0.5 * lineLength + i * lineInterval;
                })
                .attr("cy", beginY)
                .attr("r", function() {
                    if (linechartWidth < 400) return 3;
                    else return 5;
                })
                .attr("fill", () => {
                    if (i == 0) return lineColor1;
                    if (i == 1) return lineColor2;
                    if (i == 2) return lineColor3;
                    if (i == 3) return lineColor4;
                })
            linechartsvg.append("text")
                .attr("x", function() {
                    return (beginX + lineLength) + 5 + i * lineInterval;
                })
                .attr("y", 0.3 * linechartMargin.top + 0.5 * linetextSize)
                .text(function() {
                    if (i == 0) return "現金買入";
                    if (i == 1) return "現金賣出";
                    if (i == 2) return "即期買入";
                    if (i == 3) return "即期賣出";
                })
                .attr("text-anchor", "start")
                .attr("font-family", "Noto Sans TC")
                .attr("font-size", linetextSize + "px")
                .attr("fill", () => {
                    if (i == 0) return lineColor1;
                    if (i == 1) return lineColor2;
                    if (i == 2) return lineColor3;
                    if (i == 3) return lineColor4;
                });
        }


        for (var i = 0; i < 4; ++i) {
            linechartsvg.append('path')
                .attr("class", "historylines" + i)
                .attr({
                    'd': lines[i](dividedCountryData[whichCountry]),
                    'stroke': function(d) {
                        if (i == 0) return lineColor1;
                        if (i == 1) return lineColor2;
                        if (i == 2) return lineColor3;
                        if (i == 3) return lineColor4;
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
                // 'stroke': 'rgba(0,0,0,.1)',
                'transform': 'translate(' + (linechartMargin.left) + ', ' + (linechartHeight + linechartMargin.top) + ')'
            });
        //繪出Y軸標格
        linechartsvg.append('g')
            .call(axisYGrid)
            .attr({
                'fill': 'none',
                'stroke': 'rgba(170,170,170,0.15)',
                // 'stroke': 'rgba(0,0,0,.1)',
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
                'font-size': '11px'
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
                'font-size': '11px'
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
            .style('stroke-width', 1)
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
                .attr('class', function(d, i) {
                    //console.log("dots" + i + " onLine" + j)
                    return "dots" + i + " onLine" + j;
                })
                .attr('cx', function(d) {
                    return scaleX(d.x) + linechartMargin.left;
                })
                .attr('cy', function(d) {
                    if (j == 0) return scaleY(d.historyValue1) + linechartMargin.top;
                    else if (j == 1) return scaleY(d.historyValue2) + linechartMargin.top;
                    else if (j == 2) return scaleY(d.historyValue3) + linechartMargin.top;
                    else if (j == 3) return scaleY(d.historyValue4) + linechartMargin.top;
                })
                .attr('fill', function(d) {
                    if (j == 0) return lineColor1;
                    if (j == 1) return lineColor2;
                    if (j == 2) return lineColor3;
                    if (j == 3) return lineColor4;
                })
                .attr('r', originR);
        }
        //console.log(dots[1]);

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
                .attr('dy', function() {
                    return 20 * (j + 1)
                })
                .text("")
                .attr('font-family', 'Noto Sans TC');
        }

        //跟著滑鼠跑的那條線的Function
        var dotIsShining = 0; //判斷是否有某資料點正在閃爍
        var shineDistance = 3;
        //console.log(dividedCountryData[8][0].historyValue1);

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
                            .attr("x", function() {
                                // console.log(i);
                                if (i < 0.5 * dividedCountryData[whichCountry].length) return (scaleX(dividedCountryData[whichCountry][i].x) + linechartMargin.left) - infoWidth;
                                else return (scaleX(dividedCountryData[whichCountry][i].x) + linechartMargin.left);
                            })
                            .attr("y", function() {
                                //console.log((scaleY(dividedCountryData[whichCountry][i].historyValue2) - offsetY));
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
                                .attr("x", function() {
                                    if (i < 0.5 * dividedCountryData[whichCountry].length) return (scaleX(dividedCountryData[whichCountry][i].x) + linechartMargin.left) - infoWidth;
                                    else return (scaleX(dividedCountryData[whichCountry][i].x) + linechartMargin.left);
                                })
                                .attr("y", function() {
                                    if (dividedCountryData[whichCountry][0].historyValue2 == 0) {
                                        return (scaleY(dividedCountryData[whichCountry][i].historyValue4) + linechartMargin.top);
                                    }
                                    return (scaleY(dividedCountryData[whichCountry][i].historyValue2) + linechartMargin.top);
                                })
                                .text(function(d) {
                                    if (j == 0) return dividedCountryData[whichCountry][i].date + "(" + chineseCountryName[whichCountry] + dividedCountryData[whichCountry][i].country + ")";
                                    if (j == 1) return "現金買入 : " + dividedCountryData[whichCountry][i].historyValue1;
                                    if (j == 2) return "現金賣出 : " + dividedCountryData[whichCountry][i].historyValue2;
                                    if (j == 3) return "即期買入 : " + dividedCountryData[whichCountry][i].historyValue3;
                                    if (j == 4) return "即期賣出 : " + dividedCountryData[whichCountry][i].historyValue4;
                                });
                        }
                        //console.log("Shining: dot" + i);
                    } else if (dotIsShining != 0) { //當有某資料點正在閃爍且滑鼠離該資料點的x軸距離大於10的時候
                        //讓閃爍的點恢復成原來的樣子
                        //透過filter篩選class裡的class，還原正確的顏色
                        d3.selectAll(".dots" + i)
                            .filter(".onLine0")
                            .attr('fill', function(d) {
                                return lineColor1;
                            });
                        d3.selectAll(".dots" + i)
                            .filter(".onLine1")
                            .attr('fill', function(d) {
                                return lineColor2;
                            });
                        d3.selectAll(".dots" + i)
                            .filter(".onLine2")
                            .attr('fill', function(d) {
                                return lineColor3;
                            });
                        d3.selectAll(".dots" + i)
                            .filter(".onLine3")
                            .attr('fill', function(d) {
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
                    .style('opacity', function() {
                        if (mousePosOnLinechart[0] > (scaleX(dividedCountryData[whichCountry][0].x) + linechartMargin.left) + 10)
                            return 0;
                        if (mousePosOnLinechart[0] < scaleX(dividedCountryData[whichCountry][dividedCountryData[whichCountry].length - 1].x) + linechartMargin.left)
                            return 0;
                        return 1;
                    })
                    .transition()
                    .duration(10)
                    .attr('x1', mousePosOnLinechart[0])
                    .attr('y1', 0 + linechartMargin.top)
                    .attr('x2', mousePosOnLinechart[0])
                    .attr('y2', mousePosOnLinechart[1] + (linechartHeight - mousePosOnLinechart[1] + linechartMargin.top));
            }

        }

        //換資料
        var dataChangingTime = 750;

        function updateData() {
            dataIsChanging = 1;

            //重新定義一些資料
            minX = d3.min(dividedCountryData[whichCountry], function(d) { return parseInt(d.x) });
            maxX = d3.max(dividedCountryData[whichCountry], function(d) { return parseInt(d.x) });
            minY = d3.min(dividedCountryData[whichCountry], function(d) {
                    if (d.historyValue1 == 0) {
                        return d.historyValue3;
                    } else return d.historyValue1
                }), //value1 is always the lowest
                maxY = d3.max(dividedCountryData[whichCountry], function(d) {
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
                    .x(function(d) { return scaleX(d.x); })
                    .y(function(d) {
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
                        .attr('cx', function(d) {
                            return scaleX(dividedCountryData[whichCountry][i].x) + linechartMargin.left;
                        })
                        .attr('cy', function(d) {
                            //console.log(scaleY(dividedCountryData[whichCountry][i].historyValue2) - offsetY);
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
                    'font-size': '11px'
                });

            //當在更換資料時，不能進行其他mouseEvent
            setTimeout(function() {
                dataIsChanging = 0;
            }, dataChangingTime + 50);

        } //updateData();

        var MenuActive;
        d3.selectAll("ul li a")
            .on("click", function() {
                //update active class
                MenuActive = document.getElementsByClassName("menu active");
                MenuActive[0].className = "menu";
                this.className += " active "
                for (var i = 0; i < allCountryName.length; ++i) {
                    if (this.id.split("btn")[1] == allCountryName[i]) {
                        whichCountry = i;
                        //console.log(whichCountry);
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

        for (var i = 0; i < allCountryName.length; ++i) {
            if (dividedCountryData[i][1].historyValue1 != 0 && (dividedCountryData[i][0].historyValue1 - dividedCountryData[i][1].historyValue1) != 0) {
                if ((dividedCountryData[i][0].historyValue1 - dividedCountryData[i][1].historyValue1) / dividedCountryData[i][1].historyValue1 > 0) {
                    PoscashBuyChange.push({ country: allCountryName[i], changeValue: (dividedCountryData[i][0].historyValue1 - dividedCountryData[i][1].historyValue1) / dividedCountryData[i][1].historyValue1 });
                } else {
                    NegcashBuyChange.push({ country: allCountryName[i], changeValue: Math.abs((dividedCountryData[i][0].historyValue1 - dividedCountryData[i][1].historyValue1) / dividedCountryData[i][1].historyValue1) });
                }
            }
            if (dividedCountryData[i][1].historyValue2 != 0 && (dividedCountryData[i][0].historyValue2 - dividedCountryData[i][1].historyValue2) != 0) {
                if ((dividedCountryData[i][0].historyValue2 - dividedCountryData[i][1].historyValue2) / dividedCountryData[i][1].historyValue2 > 0) {
                    PoscashSellChange.push({ country: allCountryName[i], changeValue: (dividedCountryData[i][0].historyValue2 - dividedCountryData[i][1].historyValue2) / dividedCountryData[i][1].historyValue2 });
                } else {
                    NegcashSellChange.push({ country: allCountryName[i], changeValue: Math.abs((dividedCountryData[i][0].historyValue2 - dividedCountryData[i][1].historyValue2) / dividedCountryData[i][1].historyValue2) });
                }
            }
            if (dividedCountryData[i][1].historyValue3 != 0 && (dividedCountryData[i][0].historyValue3 - dividedCountryData[i][1].historyValue3) != 0) {
                if ((dividedCountryData[i][0].historyValue3 - dividedCountryData[i][1].historyValue3) / dividedCountryData[i][1].historyValue3 > 0) {
                    PosSightBuyChange.push({ country: allCountryName[i], changeValue: (dividedCountryData[i][0].historyValue3 - dividedCountryData[i][1].historyValue3) / dividedCountryData[i][1].historyValue3 });
                } else {
                    NegSightBuyChange.push({ country: allCountryName[i], changeValue: Math.abs((dividedCountryData[i][0].historyValue3 - dividedCountryData[i][1].historyValue3) / dividedCountryData[i][1].historyValue3) });
                }
            }
            if (dividedCountryData[i][1].historyValue4 != 0 && (dividedCountryData[i][0].historyValue4 - dividedCountryData[i][1].historyValue4) != 0) {
                if ((dividedCountryData[i][0].historyValue4 - dividedCountryData[i][1].historyValue4) / dividedCountryData[i][1].historyValue4 > 0) {
                    PosSightSellChange.push({ country: allCountryName[i], changeValue: (dividedCountryData[i][0].historyValue4 - dividedCountryData[i][1].historyValue4) / dividedCountryData[i][1].historyValue4 });
                } else {
                    NegSightSellChange.push({ country: allCountryName[i], changeValue: Math.abs((dividedCountryData[i][0].historyValue4 - dividedCountryData[i][1].historyValue4) / dividedCountryData[i][1].historyValue4) });
                }
            }
        }
        var PosArr = [PoscashBuyChange.length, PoscashSellChange.length, PosSightBuyChange.length, PosSightSellChange.length];
        var PosNum = d3.max(PosArr);
        var NegArr = [NegcashBuyChange.length, NegcashSellChange.length, NegSightBuyChange.length, NegSightSellChange.length];
        var NegNum = d3.max(NegArr);

        var allKindOfRate = [NegcashBuyChange, PoscashBuyChange, NegcashSellChange, PoscashSellChange, NegSightBuyChange, PosSightBuyChange, NegSightSellChange,
            PosSightSellChange
        ];

        for (var i = 0; i < 8; ++i) {
            allKindOfRate[i].sort(function(x, y) { return d3.descending(x.changeValue, y.changeValue); });
        }

        /* Create gradient color */
        var deepColor1 = "#359768",
            lightColor1 = "#CEFFCE",
            deepColor2 = "#ff7575",
            lightColor2 = "#FFD2D2";

        var countryNegColor = d3.scale
            .linear()
            .domain([1, NegNum])
            .range([deepColor1, lightColor1]); //由深到淺
        var countryPosColor = d3.scale
            .linear()
            .domain([1, PosNum])
            .range([deepColor2, lightColor2]);

        /* Start to draw */
        var barchartMargin = { top: 20, right: 20, bottom: 70, left: 100 };
        var barchartWidth = 800 - barchartMargin.left - barchartMargin.right;
        var barchartHeight = 600 - barchartMargin.top - barchartMargin.bottom;

        var whichBtn = 0;

        var barchartScaleX = d3.scale.ordinal().rangeRoundBands([0, barchartWidth], 0.1).domain(allKindOfRate[whichBtn].map(function(d) { return d.country; }));
        var barchartScaleY = d3.scale.linear().range([barchartHeight, 0]).domain([0, d3.max(allKindOfRate[whichBtn], function(d) { return d.changeValue; })]);

        var barchartScaleXAxis = d3.svg.axis()
            .scale(barchartScaleX)
            .orient("bottom")
            .ticks(10);

        var barchartScaleYAxis = d3.svg.axis()
            .scale(barchartScaleY)
            .orient("left")
            .ticks(10);

        var barchartSvg = d3.select("body").append("svg")
            .attr("width", barchartWidth + barchartMargin.left + barchartMargin.right)
            .attr("height", barchartHeight + barchartMargin.top + barchartMargin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + barchartMargin.left + "," + barchartMargin.top + ")");

        barchartSvg.append("g")
            .attr("class", "barchartScaleXAxis")
            .attr("transform", "translate(0," + barchartHeight + ")")
            .call(barchartScaleXAxis)
            .attr({
                'fill': 'none',
                'stroke': '#000'
            })
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", ".8em")
            .attr("dy", ".55em")
            .attr("transform", "rotate(0)")
            .attr({
                'fill': '#000',
                'stroke': 'none'
            });

        barchartSvg.append("g")
            .attr("class", "barchartScaleYAxis")
            .call(barchartScaleYAxis)
            .attr({
                'fill': 'none',
                'stroke': '#000'
            })
            .selectAll("text")
            .attr({
                'fill': '#000',
                'stroke': 'none'
            })
            .style("text-anchor", "end");

        var barRect = barchartSvg.selectAll(".barRect")
            .data(NegcashBuyChange);

        barRect.enter().append("rect")
            .style("fill", (d, i) => {
                if (whichBtn % 2 == 0)
                    return countryNegColor(i);
                else return countryPosColor(i)
            })
            .attr("class", "barRect")
            .attr("x", function(d) { return barchartScaleX(d.country); })
            .attr("width", barchartScaleX.rangeBand())
            .attr("y", function(d) { return barchartScaleY(d.changeValue); })
            .attr("height", function(d) { return barchartHeight - barchartScaleY(d.changeValue); });


        ///////////////////
        var barchartSvg2 = d3.select("body").append("svg")
            .attr("width", barchartWidth + barchartMargin.left + barchartMargin.right)
            .attr("height", barchartHeight + barchartMargin.top + barchartMargin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + barchartMargin.left + "," + barchartMargin.top + ")");



        /////////


        d3.select("body").selectAll("button").on("click", function() {
            for (var i = 0; i < 8; ++i) {
                // console.log(this.className.split("button")[1][0]);
                if (this.className.split("button")[1][0] == i) {
                    whichBtn = i;
                    console.log(whichBtn);
                }
            }
            updateData2();
        });

        function updateData2() {
            dataIsChanging = 1;

            //重新定義一些資料
            barchartScaleX = d3.scale.ordinal().rangeRoundBands([0, barchartWidth], 0.1).domain(allKindOfRate[whichBtn].map(function(d) { return d.country; }));
            barchartScaleY = d3.scale.linear().range([barchartHeight, 0]).domain([0, d3.max(allKindOfRate[whichBtn], function(d) { return d.changeValue; })]);

            //更改X,Y軸

            barchartScaleXAxis = d3.svg.axis()
                .scale(barchartScaleX)
                .orient("bottom")
                .ticks(10);

            barchartScaleYAxis = d3.svg.axis()
                .scale(barchartScaleY)
                .orient("left")
                .ticks(10);

            d3.select("body")
                .transition()
                .select(".barchartScaleXAxis") // change the x axis
                .duration(dataChangingTime)
                .call(barchartScaleXAxis)
                .attr({
                    'fill': 'none',
                    'stroke': '#000'
                })
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", ".8em")
                .attr("dy", ".55em")
                .attr("transform", "rotate(0)")
                .attr({
                    'fill': '#000',
                    'stroke': 'none'
                });

            d3.select("body")
                .transition()
                .select(".barchartScaleYAxis") // change the y axis
                .duration(dataChangingTime)
                .call(barchartScaleYAxis)
                .attr({
                    'fill': 'none',
                    'stroke': '#000'
                })
                .selectAll("text")
                .attr({
                    'fill': '#000',
                    'stroke': 'none'
                })
                .style("text-anchor", "end");

            barRect.remove();

            //console.log(barRect);

            barRect = barchartSvg.selectAll(".barRect")
                .data(allKindOfRate[whichBtn]);

            barRect.enter().append("rect")
                .style("fill", (d, i) => {
                    if (whichBtn % 2 == 0)
                        return countryNegColor(i);
                    else return countryPosColor(i);
                })
                .attr("class", "barRect")
                .attr("x", function(d) { return barchartScaleX(d.country); })
                .attr("width", 0)
                .attr("y", function(d) { return barchartScaleY(d.changeValue); })
                .attr("height", 0)
                .transition()
                .duration(dataChangingTime)
                .attr("width", barchartScaleX.rangeBand())
                .attr("height", function(d) { return barchartHeight - barchartScaleY(d.changeValue); });

        } //updateData2();


        ///////////////////////////////////////////////////////////////////////////////////////////////
        // var pie = d3.layout.pie()
        //     .value(function(d) {
        //         return d.changeValue;
        //     });

        // var pieData = [pie(NegcashBuyChange), pie(PoscashBuyChange),
        //     pie(NegcashSellChange), pie(PoscashSellChange),
        //     pie(NegSightBuyChange), pie(PosSightBuyChange),
        //     pie(NegSightSellChange), pie(PosSightSellChange)
        // ];
        // // console.log(pieData);

        // var pieChartWidth = 320;
        // var pieChartHeight = 400;

        // var outerRadius = pieChartWidth / 2;
        // var innerRadius = pieChartWidth / 3;

        // var textOffset = 260;

        // var arc = d3.svg.arc()
        //     .outerRadius(outerRadius - 50)
        //     .innerRadius(innerRadius - 50);

        // var textArc = d3.svg.arc()
        //     .outerRadius(outerRadius + textOffset)
        //     .innerRadius(innerRadius + textOffset);

        // var pieChartSvgWidth = screen.availWidth * 0.5 - 20;
        // var pieChartSvgHeight = screen.availHeight * 0.94;

        // var PieChartSvg = [8];
        // //創造八張圖
        // for (var a = 0; a < 8; ++a) {
        //     PieChartSvg[a] = d3.select("body")
        //         .append("svg")
        //         .attr("width", pieChartSvgWidth)
        //         .attr("height", pieChartSvgHeight)
        //         .attr("class", "PieChartSvg" + a);

        //     PieChartSvg[a].append("rect")
        //         .attr("width", "100%")
        //         .attr("height", "100%")
        //         .attr("fill", function() {
        //             if (a == 0 || a == 1) return "#ffffff";
        //             if (a == 2 || a == 3) return "#f7f7f7";
        //             if (a == 4 || a == 5) return "#ffffff";
        //             if (a == 6 || a == 7) return "#f7f7f7";
        //         });


        //     //繪製弧形
        //     var arcs = PieChartSvg[a].selectAll("g.arc")
        //         .data(pieData[a])
        //         .enter()
        //         .append("g") //分組
        //         .attr("class", function() {
        //             return "arc";
        //         })
        //         .attr("transform", "translate(" + (outerRadius + textOffset - 80) + "," + (outerRadius + textOffset - 80) + ")"); //將每組移到中心

        //     //將組中每個元素繪製弧形路徑
        //     arcs.append("path") //每個g元素都追加一個path元素用綁訂到這個g的數據d生成路徑訊息
        //         .attr("fill", function(d, i) {
        //             if (a % 2 == 0) {
        //                 return countryNegColor(i);
        //             } else {
        //                 return countryPosColor(i);
        //             }
        //         })
        //         // .attr("stroke-width", "5px")
        //         .attr("d", arc)
        //         .on("mouseover", function() {
        //             d3.select(this).attr("opacity", 0.8);
        //         })
        //         .on("mouseout", function() {
        //             d3.select(this).attr("opacity", 1);
        //         }); //將角度轉為弧度


        //     var textX, textY, textR, tmpI;
        //     //加上文字
        //     arcs.append("text")
        //         .attr("transform", function(d, i) {
        //             textX = parseFloat(textArc.centroid(d)[0]);
        //             textY = parseFloat(textArc.centroid(d)[1]);
        //             textR = Math.sqrt(Math.pow(Math.abs(textX), 2) + Math.pow(Math.abs(textY), 2));
        //             tmpI = i;
        //             // console.log((textX / 14) * (i + 1), (textY / 14) * (i + 1));

        //             //一高一低
        //             // console.log(((textX / 14) * (7)), ((textY / 14) * (7)));
        //             if (i % 2 == 0) return "translate(" + ((textX / 14) * (7)) + "," + ((textY / 14) * (7)) + ")";
        //             else return "translate(" + ((textX / 14) * (10)) + "," + ((textY / 14) * (10)) + ")";

        //             //兩段式
        //             // if (tmpI >= 0.5 * NegcashBuyChange.length) tmpI -= 0.5 * NegcashBuyChange.length;
        //             // return "translate(" + ((textX / NegcashBuyChange.length) * (0.5 * NegcashBuyChange.length + tmpI * 0.5)) + "," + ((textY / NegcashBuyChange.length) * (0.5 * NegcashBuyChange.length + tmpI * 0.5)) + ")";

        //             //大圓
        //             // return "translate(" + textArc.centroid(d) + ")"; //centroid(d)可得出弧形的中心點
        //         })
        //         .attr("text-anchor", "middle")
        //         .attr("font-family", "Noto Sans TC")
        //         .text(function(d, i) {
        //             for (var w = 0; w < allCountryName.length; ++w) {
        //                 if (d.data.country == allCountryName[w]) {
        //                     return chineseCountryName[w];
        //                 }
        //             }
        //             // console.log(d.data.country)
        //             // return d.data.country;
        //         })
        //         .append('tspan') //create a linebreak
        //         .attr("x", 0)
        //         .attr("y", 20)
        //         .attr("text-anchor", "middle")
        //         .attr("font-family", "Noto Sans TC")
        //         .text(function(d) {
        //             return (d.value * 100).toFixed(3) + "%";
        //         });
        //     //加上線段
        //     arcs.append("line") // attach a line
        //         .style("stroke", function(d, i) {
        //             if (a % 2 == 0) {
        //                 return countryNegColor(i);
        //             } else {
        //                 return countryPosColor(i);
        //             }
        //         })
        //         .style("stroke-width", 0.5)
        //         .attr("x1", function(d, i) {
        //             textX = parseFloat(textArc.centroid(d)[0]);
        //             return 0.25 * textX;
        //         })
        //         .attr("x2", function(d, i) {
        //             textX = parseFloat(textArc.centroid(d)[0]);
        //             if (i % 2 == 0) {
        //                 return 0.42 * textX;
        //             } else {
        //                 return 0.65 * textX;
        //             }

        //         })
        //         .attr("y1", function(d, i) {
        //             textY = parseFloat(textArc.centroid(d)[1]);
        //             return 0.25 * textY;
        //         })
        //         .attr("y2", function(d, i) {
        //             textY = parseFloat(textArc.centroid(d)[1]);
        //             if (i % 2 == 0) {
        //                 return 0.42 * textY;
        //             } else {
        //                 return 0.65 * textY;
        //             }
        //         });

        //     arcs.append("text")
        //         .attr("text-anchor", "middle")
        //         .attr('font-size', '18px')
        //         .attr("font-family", "Noto Sans TC")
        //         .attr('y', 0)
        //         .text(function(d, i) {
        //             if (i == 0) { //append一次就好
        //                 if (a == 0) return "現金買入跌幅";
        //                 if (a == 2) return "現金賣出跌幅";
        //                 if (a == 4) return "即期買入跌幅";
        //                 if (a == 6) return "即期賣出跌幅";
        //                 if (a == 1) return "現金買入漲幅";
        //                 if (a == 3) return "現金賣出漲幅";
        //                 if (a == 5) return "即期買入漲幅";
        //                 if (a == 7) return "即期賣出漲幅";
        //             }
        //         });
        // arcs.append("text")
        //     .attr("text-anchor", "middle")
        //     .attr('font-size', '18px')
        //     .attr("font-family", "Noto Sans TC")
        //     .attr('y', 0.5 * pieChartSvgHeight - 10)
        //     .text(function(d, i) {
        //         if (i == 0) { //append一次就好
        //             if (a == 0) return "現金買入跌幅";
        //             if (a == 2) return "現金賣出跌幅";
        //             if (a == 4) return "即期買入跌幅";
        //             if (a == 6) return "即期賣出跌幅";
        //             if (a == 1) return "現金買入漲幅";
        //             if (a == 3) return "現金賣出漲幅";
        //             if (a == 5) return "即期買入漲幅";
        //             if (a == 7) return "即期賣出漲幅";
        //         }
        //     });

        // } //PIE for 

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // var PackDataset = [];
        // //做單層就好，這邊直接設定children
        // PackDataset[0] = { "children": NegcashBuyChange } //現金買入:跌-----
        // PackDataset[2] = { "children": NegcashSellChange } //現金賣出:跌---'-----
        // PackDataset[4] = { "children": NegSightBuyChange } //即期買入:跌---'----'-----
        // PackDataset[6] = { "children": NegSightSellChange } //即期賣出:跌--'----'----'-----
        // PackDataset[1] = { "children": PoscashBuyChange } //現金買入:漲----'    '    '    '
        // PackDataset[3] = { "children": PoscashSellChange } //現金賣出:漲--------'    '    '
        // PackDataset[5] = { "children": PosSightBuyChange } //即期買入:漲-------------'    '
        // PackDataset[7] = { "children": PosSightSellChange } //即期賣出:漲------------------

        // var packWidth = (screen.availWidth - 20) / 8,
        //     packHeight = 600;
        // var packSvgMarginLeft = 20,
        //     packSvgMarginRight = 20;


        // //create pack
        // var pack = d3.layout.pack()
        //     .padding(10) //泡泡間的間距
        //     .size([packWidth, packHeight]) //整張圖的寬高
        //     .sort(function(a, b) {
        //         return b.changeValue - a.changeValue;
        //     })
        //     .value(function(d) {
        //         return d.changeValue;
        //     });

        // //create each packSVG and node
        // var packSVG = [];
        // var nodes = [];
        // for (var i = 0; i < 8; ++i) {
        //     packSVG[i] = d3.select("#bubbleChart") //創造一個畫布
        //         .append("svg")
        //         // .attr("width", (screen.availWidth - 20) / 4)
        //         // .attr("height", (screen.availHeight - 200) / 2)
        //         .attr("width", packWidth)
        //         .attr("height", packHeight)
        //         .attr("class", "packSVG" + i);

        //     nodes[i] = pack.nodes(PackDataset[i])
        //         .filter(function(d) { //透過filter把parent過濾掉，不然外面會包一個大圓(這邊的parent就是所有children裡value的值的總和)
        //             return d.parent;
        //         });
        // }
        // //create bubbles
        // var whichSVG = 0;
        // var tmpR = 0;
        // for (var cnt = 0; cnt < 8; ++cnt) {
        //     d3.select(".packSVG" + cnt)
        //         .selectAll("circle") // 建立 circle 的 Selection
        //         .data(nodes[cnt]) // 綁定 selection 與資料
        //         .enter() // 對於任何沒被對應而落單的資料 ...
        //         .append("circle") // 新增一個 circle 標籤
        //         .attr({
        //             // cx: function(d) { return d.x + packSvgMarginLeft; }, // 用 x,y 當圓心
        //             // cy: function(d) { return d.y; },
        //             r: function(d) { return 1 * d.r; }, // 用 r 當半徑
        //             id: function(d, i) {
        //                 // console.log(d, i);
        //                 // console.log("circlesOnSVG" + cnt + i);
        //                 return "circlesOnSVG" + cnt + i;

        //             },
        //             // stroke: "#5B5B5B", // 邊框畫灰色
        //             class: "circlesOnSVG" + cnt
        //         })
        //         .on("mouseover", function(d, i) {
        //             whichSVG = d3.select(this).attr("class").split("circlesOnSVG")[1];
        //             //fade
        //             d3.select(this)
        //                 .attr("fill-opacity", 0.82);

        //             //countryName zoom in
        //             d3.select(".svgtextName" + whichSVG + i)
        //                 .transition()
        //                 .duration(500)
        //                 .attr("font-size", "24px")
        //                 .attr("opacity", "1");

        //             //countryValue fade in
        //             d3.select(".svgtext" + whichSVG + i)
        //                 .transition()
        //                 .duration(500)
        //                 .attr("font-size", "24px")
        //                 .attr("opacity", "1");
        //         })
        //         .on("mouseout", function(d, i) {
        //             tmpR = d3.select(this).attr("r");

        //             //fill color
        //             d3.select(this)
        //                 .attr("fill-opacity", 1);

        //             //countryName zoom out
        //             d3.select(".svgtextName" + whichSVG + i)
        //                 .transition()
        //                 .duration(500)
        //                 .attr("font-size", function(d, i) {
        //                     if (tmpR > 50) return "20px";
        //                     else if (tmpR > 25) return "12px";
        //                     else if (tmpR < 12) return Math.floor(tmpR - 4) + "px";
        //                     else return "10px"; //radius : 12-25 == > 10px 
        //                 });

        //             //countryValue fade out
        //             d3.select(".svgtext" + whichSVG + i)
        //                 .transition()
        //                 .duration(500)
        //                 .attr("font-size", "1px")
        //                 .attr("opacity", "0");
        //         });

        //     d3.select(".packSVG" + cnt)
        //         .selectAll("text")
        //         .data(nodes[cnt])
        //         .enter()
        //         .append("text")
        //         .attr("class", function(d, i) {
        //             // console.log("svgtextName" + d.country + cnt);
        //             return "svgtextName" + cnt + i;
        //         })
        //         .attr({
        //             x: function(d) { return packWidth * 0.5; },
        //             // y: function(d) {
        //             //     // console.log(this.className)
        //             //     return d.y;
        //             // },
        //             // x: function(d) { return d.x + packSvgMarginLeft; },
        //             // y: function(d) { return d.y; },
        //             "text-anchor": "middle",
        //         })
        //         .text(function(d, i) {
        //             for (var w = 0; w < allCountryName.length; ++w) {
        //                 if (d.country == allCountryName[w]) {
        //                     return chineseCountryName[w];
        //                 }

        //             }
        //             //return d.country; //////////////////////////
        //         })
        //         .attr("font-family", "Noto Sans TC")
        //         .attr("font-size", function(d, i) {
        //             if (d.r > 50) return "20px";
        //             else if (d.r > 25) return "12px";
        //             else if (d.r < 12) return Math.floor(d.r - 4) + "px";
        //             else return "10px"; //radius : 12-25 == > 10px 
        //         })
        //         .attr("fill", function(d) {
        //             return "black";
        //         })
        //         .on("mouseover", function(d, i) {
        //             //countryName zoom in
        //             d3.select(this)
        //                 .transition()
        //                 .duration(500)
        //                 .attr("font-size", "24px")
        //                 .attr("opacity", "1");

        //             //countryValue fade in
        //             d3.select(".svgtext" + whichSVG + i)
        //                 .transition()
        //                 .duration(500)
        //                 .attr("font-size", "24px")
        //                 .attr("opacity", "1");
        //         })
        //         .on("mouseout", function(d, i) {
        //             //countryName zoom out
        //             d3.select(this)
        //                 .transition()
        //                 .duration(500)
        //                 .attr("font-size", function(d, i) {
        //                     if (d.r > 50) return "20px";
        //                     else if (d.r > 25) return "12px";
        //                     else if (d.r < 12) return Math.floor(d.r - 4) + "px";
        //                     else return "10px"; //radius : 12-25 == > 10px 
        //                 })
        //                 .attr("opacity", "1");

        //             //countryValue fade out
        //             d3.select(".svgtext" + whichSVG + i)
        //                 .transition()
        //                 .duration(500)
        //                 .attr("font-size", "1px")
        //                 .attr("opacity", "0");
        //         })
        //         .append('tspan') //create a linebreak
        //         .attr("class", function(d, i) {
        //             return "svgtext" + cnt + i;
        //         })
        //         .attr({
        //             x: function(d) { return packWidth * 0.5; },
        //             // y: function(d) { return d.y + 25; },
        //             "text-anchor": "middle",
        //         })
        //         .text(function(d) {
        //             return (d.changeValue * 100).toFixed(3) + "%";
        //         })
        //         .attr("font-family", "sans-serif")
        //         .attr("font-size", "1px")
        //         .attr("fill", function(d) {
        //             return "black";
        //         })
        //         .attr("opacity", "0")
        //         .on("mouseover", function(d, i) {
        //             //countryName zoom in
        //             d3.select(".svgtextName" + whichSVG + i)
        //                 .transition()
        //                 .duration(500)
        //                 .attr("font-size", "24px")
        //                 .attr("opacity", "1");

        //             //countryValue fade in
        //             d3.select(this)
        //                 .transition()
        //                 .duration(500)
        //                 .attr("font-size", "24px")
        //                 .attr("opacity", "1");
        //         })
        //         .on("mouseout", function(d, i) {
        //             //countryName zoom out
        //             d3.select(".svgtextName" + whichSVG + i)
        //                 .transition()
        //                 .duration(500)
        //                 .attr("font-size", function(d, i) {
        //                     if (d.r > 50) return "20px";
        //                     else if (d.r > 25) return "12px";
        //                     else if (d.r < 12) return Math.floor(d.r - 4) + "px";
        //                     else return "10px"; //radius : 12-25 == > 10px 
        //                 })
        //                 .attr("opacity", "1");
        //             //countryValue fade out
        //             d3.select(this)
        //                 .transition()
        //                 .duration(500)
        //                 .attr("font-size", "10px")
        //                 .attr("opacity", "0");

        //         });

        //     d3.select(".packSVG" + cnt)
        //         .append("text")
        //         .attr("x", packWidth * 0.5)
        //         .attr("y", 40)
        //         .attr("text-anchor", "middle")
        //         .attr("font-family", "Noto Sans TC")
        //         .attr("fill", function() {
        //             // if (cnt < 4) return deepColor1;
        //             // else return deepColor2;
        //             return "black";
        //         })
        //         .text(function() {
        //             if (cnt == 0) return "現金買入跌幅";
        //             if (cnt == 2) return "現金賣出跌幅";
        //             if (cnt == 4) return "即期買入跌幅";
        //             if (cnt == 6) return "即期賣出跌幅";
        //             if (cnt == 1) return "現金買入漲幅";
        //             if (cnt == 3) return "現金賣出漲幅";
        //             if (cnt == 5) return "即期買入漲幅";
        //             if (cnt == 7) return "即期賣出漲幅";
        //         });

        //     // console.log(d3.selectAll(".circlesOnSVG" + cnt));


        // } //for
        // var prevR = 0;
        // var currentR = 0;
        // var returnHeight = packHeight - 50;

        // var prevR2 = 0;
        // var currentR2 = 0;
        // var returnHeight2 = packHeight - 50;

        // var prevR3 = 0;
        // var currentR3 = 0;
        // var returnHeight3 = packHeight - 50;

        // // 下面的bubble顏色用漸層的
        // var allKindOfRate = [NegcashBuyChange, PoscashBuyChange, NegcashSellChange, PoscashSellChange, NegSightBuyChange, PosSightBuyChange, NegSightSellChange,
        //     PosSightSellChange
        // ]
        // var packLength = [NegArr[0], PosArr[0], NegArr[1], PosArr[1], NegArr[2], PosArr[2], NegArr[3], PosArr[3], ]
        // for (var n = 0; n < 8; ++n) {
        //     for (var i = 0; i < packLength[n]; ++i) {
        //         for (var j = 0; j < packLength[n]; ++j) {
        //             if (d3.selectAll(".circlesOnSVG" + n)[0][j].__data__.country == allKindOfRate[n][i].country) {
        //                 // console.log(d3.select(".svgtextName" + n + j));
        //                 // console.log(d3.select("#circlesOnSVG" + n + j));

        //                 d3.select("#circlesOnSVG" + n + j)
        //                     .attr("fill", function() {
        //                         if (n % 2 == 0) return countryNegColor(i + 1);
        //                         else return countryPosColor(i + 1);
        //                     })
        //                     .attr({
        //                         "cx": packWidth * 0.5,
        //                         "cy": function() {
        //                             // console.log(this);
        //                             //console.log(i);
        //                             currentR = parseFloat(d3.select(this).attr("r"));
        //                             if (i == 0) {
        //                                 returnHeight = packHeight - 50;
        //                             } else {
        //                                 returnHeight -= (prevR + currentR);
        //                             }
        //                             prevR = parseFloat(d3.select(this).attr("r"));
        //                             return returnHeight;
        //                         }
        //                     });

        //                 d3.select(".svgtextName" + n + j)
        //                     .attr("y", function() {
        //                         // console.log(this);
        //                         //console.log(i);
        //                         currentR2 = parseFloat(d3.select("#circlesOnSVG" + n + j).attr("r"));
        //                         if (i == 0) {
        //                             returnHeight2 = packHeight - 50;
        //                         } else {
        //                             returnHeight2 -= (prevR2 + currentR2);
        //                         }
        //                         prevR2 = parseFloat(d3.select("#circlesOnSVG" + n + j).attr("r"));
        //                         return returnHeight2;
        //                     });

        //                 d3.select(".svgtext" + n + j)
        //                     .attr("y", function() {
        //                         // console.log(this);
        //                         //console.log(i);
        //                         currentR3 = parseFloat(d3.select("#circlesOnSVG" + n + j).attr("r"));
        //                         if (i == 0) {
        //                             returnHeight3 = packHeight - 50;
        //                         } else {
        //                             returnHeight3 -= (prevR3 + currentR3);
        //                         }
        //                         prevR3 = parseFloat(d3.select("#circlesOnSVG" + n + j).attr("r"));
        //                         return returnHeight3 + 20;
        //                     });
        //                 // console.log(d3.selectAll(".circlesOnSVG0")[0][j].__data__.country);
        //                 // console.log(d3.select("#circlesOnSVG0" + j).attr("fill", countryNegColor(i + 1)));
        //                 // console.log(i);
        //             }
        //         }
        //     }
        //     returnHeight = packHeight - 50;
        // }

    }) //d3.csv