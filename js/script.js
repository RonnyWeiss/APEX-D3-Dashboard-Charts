var apexDashboardChart = (function () {
    "use strict";
    var util = {
        /**********************************************************************************
         ** required functions 
         *********************************************************************************/
        featureInfo: {
            name: "APEX-D3Dashboard-Charts",
            info: {
                scriptVersion: "2.6",
                utilVersion: "1.3.5",
                url: "https://github.com/RonnyWeiss",
                url2: "https://ronnyweiss.app",
                license: "MIT"
            }
        },
        isDefinedAndNotNull: function (pInput) {
            if (typeof pInput !== "undefined" && pInput !== null && pInput != "") {
                return true;
            } else {
                return false;
            }
        },
        isAPEX: function () {
            if (typeof (apex) !== 'undefined') {
                return true;
            } else {
                return false;
            }
        },
        varType: function (pObj) {
            if (typeof pObj === "object") {
                var arrayConstructor = [].constructor;
                var objectConstructor = ({}).constructor;
                if (pObj.constructor === arrayConstructor) {
                    return "array";
                }
                if (pObj.constructor === objectConstructor) {
                    return "json";
                }
            } else {
                return typeof pObj;
            }
        },
        debug: {
            info: function () {
                if (util.isAPEX()) {
                    var i = 0;
                    var arr = [];
                    for (var prop in arguments) {
                        arr[i] = arguments[prop];
                        i++;
                    }
                    arr.push(util.featureInfo);
                    apex.debug.info.apply(this, arr);
                }
            },
            error: function () {
                var i = 0;
                var arr = [];
                for (var prop in arguments) {
                    arr[i] = arguments[prop];
                    i++;
                }
                arr.push(util.featureInfo);
                if (util.isAPEX()) {
                    apex.debug.error.apply(this, arr);
                } else {
                    console.error.apply(this, arr);
                }
            }
        },
        /**********************************************************************************
         ** optinal functions 
         *********************************************************************************/
        groupObjectArray: function (objectArr, jSONKey) {
            if (objectArr && Array.isArray(objectArr)) {
                return objectArr.reduce(function (retVal, x) {
                    var key = x[jSONKey];
                    if (key) {
                        /* workaround for object sort of numbers */
                        key = "\u200b" + key;
                        (retVal[key] = retVal[key] || []).push(x);
                    }
                    return retVal;
                }, {});
            } else {
                return [];
            }
        },
        link: function (link, tabbed) {
            if (tabbed) {
                window.open(link, "_blank");
            } else {
                return window.parent.location.href = link;
            }
        },
        escapeHTML: function (str) {
            if (str === null) {
                return null;
            }
            if (typeof str === "undefined") {
                return;
            }
            if (typeof str === "object") {
                try {
                    str = JSON.stringify(str);
                } catch (e) {
                    /*do nothing */
                }
            }
            if (util.isAPEX()) {
                return apex.util.escapeHTML(String(str));
            } else {
                str = String(str);
                return str
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#x27;")
                    .replace(/\//g, "&#x2F;");
            }
        },
        loader: {
            start: function (id, setMinHeight) {
                if (setMinHeight) {
                    $(id).css("min-height", "100px");
                }
                if (util.isAPEX()) {
                    apex.util.showSpinner($(id));
                } else {
                    /* define loader */
                    var faLoader = $("<span></span>");
                    faLoader.attr("id", "loader" + id);
                    faLoader.addClass("ct-loader");

                    /* define refresh icon with animation */
                    var faRefresh = $("<i></i>");
                    faRefresh.addClass("fa fa-refresh fa-2x fa-anim-spin");
                    faRefresh.css("background", "rgba(121,121,121,0.6)");
                    faRefresh.css("border-radius", "100%");
                    faRefresh.css("padding", "15px");
                    faRefresh.css("color", "white");

                    /* append loader */
                    faLoader.append(faRefresh);
                    $(id).append(faLoader);
                }
            },
            stop: function (id, removeMinHeight) {
                if (removeMinHeight) {
                    $(id).css("min-height", "");
                }
                $(id + " > .u-Processing").remove();
                $(id + " > .ct-loader").remove();
            }
        },
        jsonSaveExtend: function (srcConfig, targetConfig) {
            var finalConfig = {};
            var tmpJSON = {};
            /* try to parse config json when string or just set */
            if (typeof targetConfig === 'string') {
                try {
                    tmpJSON = JSON.parse(targetConfig);
                } catch (e) {
                    util.debug.error({
                        "msg": "Error while try to parse targetConfig. Please check your Config JSON. Standard Config will be used.",
                        "err": e,
                        "targetConfig": targetConfig
                    });
                }
            } else {
                tmpJSON = $.extend(true, {}, targetConfig);
            }
            /* try to merge with standard if any attribute is missing */
            try {
                finalConfig = $.extend(true, {}, srcConfig, tmpJSON);
            } catch (e) {
                finalConfig = $.extend(true, {}, srcConfig);
                util.debug.error({
                    "msg": "Error while try to merge 2 JSONs into standard JSON if any attribute is missing. Please check your Config JSON. Standard Config will be used.",
                    "err": e,
                    "finalConfig": finalConfig
                });
            }
            return finalConfig;
        },
        printDOMMessage: {
            show: function (id, text, icon, color) {
                var div = $("<div></div>")
                    .css("margin", "12px")
                    .css("text-align", "center")
                    .css("padding", "35px 0")
                    .addClass("dominfomessagediv");

                var subDiv = $("<div></div>");

                var subDivSpan = $("<span></span>")
                    .addClass("fa")
                    .addClass(icon || "fa-info-circle-o")
                    .addClass("fa-2x")
                    .css("height", "32px")
                    .css("width", "32px")
                    .css("color", "#D0D0D0")
                    .css("margin-bottom", "16px")
                    .css("color", color || "inhherit");

                subDiv.append(subDivSpan);

                var span = $("<span></span>")
                    .text(text)
                    .css("display", "block")
                    .css("color", "#707070")
                    .css("text-overflow", "ellipsis")
                    .css("overflow", "hidden")
                    .css("white-space", "nowrap")
                    .css("font-size", "12px");

                div
                    .append(subDiv)
                    .append(span);

                $(id).append(div);
            },
            hide: function (id) {
                $(id).children('.dominfomessagediv').remove();
            }
        },
        noDataMessage: {
            show: function (id, text) {
                util.printDOMMessage.show(id, text, "fa-search");
            },
            hide: function (id) {
                util.printDOMMessage.hide(id);
            }
        },
        errorMessage: {
            show: function (id, text) {
                util.printDOMMessage.show(id, text, "fa-exclamation-triangle", "#FFCB3D");
            },
            hide: function (id) {
                util.printDOMMessage.hide(id);
            }
        },
        cutString: function (text, textLength) {
            try {
                if (textLength < 0) return text;
                else {
                    return (text.length > textLength) ?
                        text.substring(0, textLength - 3) + "..." :
                        text
                }
            } catch (e) {
                return text;
            }
        },
        isBetween: function (pValue, pValue2, pRange) {
            var range = pRange || 0;
            var min = pValue2 - range;
            var max = pValue2 + range;
            return (pValue >= min && pValue <= max);
        }
    };

    /***********************************************************************
     **
     ** Used to set parameter from data or from config 
     **
     ***********************************************************************/
    function setObjectParameter(srcValue, cfgValue, convData2Bool) {
        if (convData2Bool) {
            if (typeof srcValue !== "undefined" && srcValue != null) {
                if (srcValue == 1 || srcValue === 'true') {
                    return true;
                } else {
                    return false;
                }
            } else {
                return cfgValue;
            }
        } else {
            if (util.isDefinedAndNotNull(srcValue)) {
                return srcValue
            } else {
                return cfgValue;
            }
        }
    }

    /***********************************************************************
     **
     ** Used to define svg shadows if needed
     **
     ***********************************************************************/
    function defineSVGShadows(pSVG, pID, pY, pX, pSize) {
        var defs = pSVG.append("defs");

        var filter = defs.append("filter")
            .attr("id", pID);

        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", pSize)
            .attr("result", "blur");
        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", pX)
            .attr("dy", pY)
            .attr("result", "offsetBlur")
        filter.append("feFlood")
            .attr("in", "offsetBlur")
            .attr("flood-color", "#000")
            .attr("flood-opacity", "0.26")
            .attr("result", "offsetColor");
        filter.append("feComposite")
            .attr("in", "offsetColor")
            .attr("in2", "offsetBlur")
            .attr("operator", "in")
            .attr("result", "offsetBlur");

        var feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode")
            .attr("in", "offsetBlur")
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");
    }

    return {
        initialize: function (pRegionID, pAjaxID, pNoDataMsg, pErrorMsg, pDefaultConfigJSON, pChartConfigJSON, pItems2Submit, pRequireHTMLEscape, pData) {
            var timers = {};
            var resizeRange = 5;

            /* this default json is used if something is missing in cofig */
            var stdConfigJSON = {
                "colSpan": 12,
                "height": 400,
                "refresh": 0
            };

            /* default d3 billboard charts options */
            var stdChartConfigJSON = {
                "gauge": {
                    "min": 0,
                    "max": null,
                    "type": "single",
                    "width": null,
                    "arcMinWidth": null,
                    "fullCircle": false
                },
                "grid": {
                    "x": true,
                    "y": true
                },
                "legend": {
                    "position": "right",
                    "show": true
                },
                "padding": {
                    "bottom": null,
                    "left": null,
                    "right": null,
                    "top": null
                },
                "shadows": true,
                "rotateAxis": false,
                "showDataLabels": false,
                "showDataPoints": true,
                "showAbsoluteValues": false,
                "tooltip": {
                    "grouped": true,
                    "show": true
                },
                "transitionDuration": 200,
                "x": {
                    "axisHeight": null,
                    "label": "x Axis",
                    "timeFormat": "%Y-%m-%dT%H:%M:%S",
                    "type": "category",
                    "tick": {
                        "cutAfter": 30,
                        "maxNumber": 25,
                        "multiline": false,
                        "rotation": 60,
                        "timeFormat": "%y-%m-%d %H:%M"
                    }
                },
                "y": {
                    "label": "y Axis 1",
                    "log": false,
                    "max": null,
                    "min": null,
                    "unit": null,
                    "tick": {
                        "maxNumber": null
                    }
                },
                "y2": {
                    "label": "y Axis 2",
                    "log": false,
                    "max": null,
                    "min": null,
                    "unit": null,
                    "tick": {
                        "maxNumber": null
                    }
                },
                "zoom": {
                    "enabled": true,
                    "type": "scroll",
                    "rescale": false
                }
            };


            /* get parent */
            var parentID = "#" + pRegionID;
            var parent = $(parentID).find(".d3dc-root");
            util.debug.info("Load...");
            if (parentID) {
                if (parent.length > 0) {
                    var configJSON = {};
                    var chartConfigJSON = {};
                    configJSON = util.jsonSaveExtend(stdConfigJSON, pDefaultConfigJSON);

                    chartConfigJSON = util.jsonSaveExtend(stdChartConfigJSON, pChartConfigJSON);

                    configJSON.d3chart = chartConfigJSON;

                    configJSON.noDataMessage = pNoDataMsg;
                    configJSON.errorMessage = pErrorMsg;

                    /* define container and add it to parent */
                    var container = drawContainer(parent);

                    /* get data and draw */
                    getData(configJSON);

                    /* try to bind APEX refreh event if "APEX" exists */
                    try {
                        $(parentID).bind("apexrefresh", function () {
                            if ($(parentID).is(':visible')) {
                                getData(configJSON);
                            }
                        });
                    } catch (e) {
                        util.errorMessage.show(parentID, configJSON.errorMessage);
                        util.debug.error({
                            "msg": "Can't bind refresh event on " + parentID + ". Apex is missing",
                            "err": e
                        });
                    }

                    /* Used to set a refresh via json configuration */
                    if (configJSON.refresh > 0) {
                        setInterval(function () {
                            if ($(parentID).is(':visible')) {
                                getData(configJSON);
                            }
                        }, configJSON.refresh * 1000);
                    }
                } else {
                    util.debug.error({
                        "msg": "Can't find element with class d3dc-root in element with id: " + pRegionID
                    });
                }
            } else {
                util.debug.error({
                    "msg": "Can't find pRegionID: " + pRegionID
                });
            }
            /***********************************************************************
             **
             ** Used to draw a container
             **
             ***********************************************************************/
            function drawContainer(pParent) {
                var div = $("<div></div>");
                div.addClass("d3dc-container");
                div.attr("id", pRegionID + "-c");
                div.css("min-height", "100px");
                pParent.append(div);
                return (div);
            }

            /************************************************************************
             **
             ** Used to prepare Data from ajax
             **
             ***********************************************************************/
            function prepareData(pAjaxResponse, pDefaultConfig) {
                util.debug.info(pAjaxResponse);
                util.debug.info("Ajax finished");

                /* clear timers */
                if (timers.innerItemsIntervals) {
                    $.each(timers.innerItemsIntervals, function (key, val) {
                        clearInterval(val);
                    });
                }
                timers.innerItemsIntervals = {};

                /* empty container for new stuff */
                container.empty();
                /* draw charts and add it to the container */
                if (pAjaxResponse.items && pAjaxResponse.items.length > 0) {
                    try {
                        var row = drawRow(container);
                        var chartNum = 0;

                        $.each(pAjaxResponse.items, function (idx, item) {
                            if (item.itemConfig) {
                                var itemConfigJSON = item.itemConfig;
                            } else {
                                var itemConfigJSON = {};
                            }

                            var colSpan = item.colSpan || configJSON.colSpan;
                            chartNum = chartNum + colSpan;
                            /* draw each chart in a col */
                            util.debug.info("Render chart  - Col " + idx);

                            var seriesData = util.groupObjectArray(item.itemData, 'seriesID');
                            drawChartCol(idx, item.height, row, colSpan, item.title, itemConfigJSON, pDefaultConfig, seriesData, item.itemData);

                            if (chartNum >= 12) {
                                row = drawRow(container);
                                chartNum = 0;
                            }

                        });
                    } catch (e) {
                        util.errorMessage.show(container, pDefaultConfig.errorMessage);
                        util.debug.error({
                            "msg": "Error while prepare data for chart",
                            "err": e
                        });
                    }
                } else {
                    container.css("min-height", "");
                    util.noDataMessage.show(container, pDefaultConfig.noDataMessage);
                }
                util.loader.stop(parentID);
                util.debug.info("Finished");
            }

            /***********************************************************************
             **
             ** Used to draw a row
             **
             ***********************************************************************/
            function drawRow(pParent) {
                var div = $("<div></div>");
                div.addClass("d3dc-row");
                pParent.append(div);
                return (div);
            }

            /***********************************************************************
             **
             ** Used to draw one chart column
             **
             ***********************************************************************/
            function drawChartCol(pColIndex, pHeight, pParent, pColSpan, pTitle, pItemConfig, pDefaultConfig, pSeriesData, pItemData) {
                var colID = pRegionID + "-c-" + pColIndex;

                /* define new column for rows */
                var col = $("<div></div>");
                col.attr("id", colID);
                col.addClass("d3dc-col-" + pColSpan);
                col.addClass("d3chartcol");
                pParent.append(col);

                if (pItemData) {
                    drawChart("#" + colID, pHeight, pItemConfig, pSeriesData, pItemData, pDefaultConfig);
                } else {
                    util.noDataMessage.show(col, pDefaultConfig.noDataMessage);
                }

                if (util.isDefinedAndNotNull(pTitle)) {
                    var title = $("<h4></h4>");
                    title.css("text-align", "center");
                    if (pRequireHTMLEscape !== false) {
                        title.text(pTitle);
                    } else {
                        title.html(pTitle);
                    }

                    col.prepend(title);
                }
            }

            /***********************************************************************
             **
             ** function to render chart
             **
             ***********************************************************************/
            function drawChart(pItemSel, pItemHeight, pConfigData, pSeriesData, pValuesData, pDefaultConfig) {

                util.debug.info({
                    "module": "drawChart",
                    "pItemSel": pItemSel,
                    "pItemHeight": pItemHeight,
                    "pConfigData": pConfigData,
                    "pSeriesData": pSeriesData,
                    "pValuesData": pValuesData,
                    "pDefaultConfig": pDefaultConfig
                });

                var aTypeCharts = ["pie", "donut", "gauge"];
                var isGauge = false;
                var isPie = false;
                var isDonut = false;

                /* search link from data and set window.location.href */
                function executeLink(seriesID, valueIdx) {
                    util.debug.info({
                        "module": "drawChart",
                        "submodule": "executeLink",
                        "seriesID": seriesID,
                        "valueIdx": valueIdx,
                        "pSeriesData": pSeriesData
                    });
                    $.each(pSeriesData, function (idx, series) {
                        util.debug.info({
                            "module": "drawChart",
                            "submodule": "executeLink",
                            "idx": idx,
                            "series": series
                        });
                        if (series && series[0] && seriesID == $.escapeSelector(series[0].seriesID)) {
                            var chartType = series[0].type;
                            /* check if atypechart*/
                            if (chartType && aTypeCharts.indexOf(chartType) >= 0) {
                                if (series[0].link) {
                                    util.link(series[0].link);
                                    return true;
                                }
                            } else {
                                if (series[valueIdx]) {
                                    if (series[valueIdx].link) {
                                        util.link(series[valueIdx].link);
                                        return true;
                                    }
                                } else {
                                    util.debug.error("Error while find correct link in data please chekc debug");
                                }
                            }
                        }
                    });
                }

                try {
                    var ownTooltip = false;

                    /* gauge */
                    var gaugeMin = setObjectParameter(pConfigData.gaugeMin, pDefaultConfig.d3chart.gauge.min);
                    var gaugeMax = setObjectParameter(pConfigData.gaugeMax, pDefaultConfig.d3chart.gauge.max);
                    var gaugeType = setObjectParameter(pConfigData.gaugeType, pDefaultConfig.d3chart.gauge.type);
                    var gaugeWidth = setObjectParameter(pConfigData.gaugeWidth, pDefaultConfig.d3chart.gauge.width);
                    var gaugeArcMinWidth = setObjectParameter(pConfigData.gaugeArcMinWidth, pDefaultConfig.d3chart.gauge.arcMinWidth);
                    var gaugeFullCircle = setObjectParameter(pConfigData.gaugeFullCircle, pDefaultConfig.d3chart.gauge.fullCircle, true);

                    /* Grid */
                    var gridX = setObjectParameter(pConfigData.gridX, pDefaultConfig.d3chart.grid.x, true);
                    var gridY = setObjectParameter(pConfigData.gridY, pDefaultConfig.d3chart.grid.y, true);
                    var shadows = setObjectParameter(pConfigData.shadows, pDefaultConfig.d3chart.shadows, true);

                    /* heights */
                    var heightXAxis = setObjectParameter(pConfigData.xAxisHeight, pDefaultConfig.d3chart.x.axisHeight);

                    /* Legend */
                    var legendShow = setObjectParameter(pConfigData.legendShow, pDefaultConfig.d3chart.legend.show, true);
                    var legendPosition = setObjectParameter(pConfigData.legendPosition, pDefaultConfig.d3chart.legend.position);

                    /* padding */
                    var chartPadding = util.jsonSaveExtend(null, pDefaultConfig.d3chart.padding);

                    if (util.isDefinedAndNotNull(pConfigData.paddingBottom)) {
                        chartPadding.bottom = pConfigData.paddingBottom;
                    }

                    if (util.isDefinedAndNotNull(pConfigData.paddingLeft)) {
                        chartPadding.left = pConfigData.paddingLeft;
                    }

                    if (util.isDefinedAndNotNull(pConfigData.paddingRight)) {
                        chartPadding.right = pConfigData.paddingRight;
                    }

                    if (util.isDefinedAndNotNull(pConfigData.paddingTop)) {
                        chartPadding.top = pConfigData.paddingTop;
                    }

                    /* Axis */
                    var rotateAxis = setObjectParameter(pConfigData.rotateAxis, pDefaultConfig.d3chart.rotateAxis, true);

                    /* tooltip */
                    var tooltipShow = setObjectParameter(pConfigData.tooltipShow, pDefaultConfig.d3chart.tooltip.show, true);
                    var tooltipGrouped = setObjectParameter(pConfigData.tooltipGrouped, pDefaultConfig.d3chart.tooltip.grouped, true);

                    /* Transition duration */
                    var transitionDuration = setObjectParameter(pConfigData.transitionDuration || pDefaultConfig.d3chart.transitionDuration);

                    /* x Axis */
                    var xShow = setObjectParameter(pConfigData.xShow, pDefaultConfig.d3chart.x.show, true);
                    var xLabel = setObjectParameter(pConfigData.xLabel, pDefaultConfig.d3chart.x.label || "");
                    var xType = setObjectParameter(pConfigData.xType, pDefaultConfig.d3chart.x.type);
                    var xAxisTimeFormat = null;
                    var xName = null;

                    /* x ticks */
                    var xTickCutAfter = setObjectParameter(pConfigData.xTickCutAfter, pDefaultConfig.d3chart.x.tick.cutAfter);
                    var xTickMaxNumber = setObjectParameter(pConfigData.xTickMaxNumber, pDefaultConfig.d3chart.x.tick.maxNumber);
                    var xTickRotation = setObjectParameter(pConfigData.xTickRotation, pDefaultConfig.d3chart.x.tick.rotation);
                    var xTickMultiline = setObjectParameter(pConfigData.xTickMultiline, pDefaultConfig.d3chart.x.tick.multiline, true);
                    var xTickTimeFormat = null;

                    if (xType == "category" || xType == "timeseries") {
                        xName = "x";
                    }

                    if (xType == "timeseries") {
                        xAxisTimeFormat = setObjectParameter(pConfigData.xTimeFormat, pDefaultConfig.d3chart.x.timeFormat);
                        xTickTimeFormat = setObjectParameter(pConfigData.xTickTimeFormat, pDefaultConfig.d3chart.x.tick.timeFormat);
                    }

                    /* cut string if category names are to long */
                    if (xType == "category") {
                        xTickTimeFormat = function (index, categoryName) {
                            return util.cutString(categoryName, xTickCutAfter);
                        };
                    }

                    /* y Axis */
                    var yLabel = pConfigData.yLabel || pDefaultConfig.d3chart.y.label || "";
                    var yLog = setObjectParameter(pConfigData.yLog, pDefaultConfig.d3chart.y.log, true);
                    var yType = null;
                    if (yLog) {
                        yType = "log";
                    }
                    var yMin = pConfigData.yMin || pDefaultConfig.d3chart.y.min;
                    var yMax = pConfigData.yMax || pDefaultConfig.d3chart.y.max;
                    var yCulling = pConfigData.yTickMaxNumber || pDefaultConfig.d3chart.y.tick.maxNumber;
                    var yUnit = pConfigData.yUnit || pDefaultConfig.d3chart.y.unit;

                    /* y2 Axis */
                    var y2Show = false;
                    var y2Label = setObjectParameter(pConfigData.y2Label, pDefaultConfig.d3chart.y2.label || "");
                    var y2Log = setObjectParameter(pConfigData.y2Log, pDefaultConfig.d3chart.y2.log, true);
                    var y2Type = null;
                    if (y2Log) {
                        y2Type = "log";
                    }
                    var y2Min = setObjectParameter(pConfigData.y2Min, pDefaultConfig.d3chart.y2.min);
                    var y2Max = setObjectParameter(pConfigData.y2Max, pDefaultConfig.d3chart.y2.max);
                    var y2Culling = setObjectParameter(pConfigData.y2TickMaxNumber, pDefaultConfig.d3chart.y2.tick.maxNumber);
                    var y2Unit = setObjectParameter(pConfigData.y2Unit, pDefaultConfig.d3chart.y2.unit);

                    /* Zoom and Subchart */
                    var zoomEnabled = setObjectParameter(pConfigData.zoomEnabled, pDefaultConfig.d3chart.zoom.enabled, true);
                    var zoom_type = setObjectParameter(pConfigData.zoomType, pDefaultConfig.d3chart.zoom.type);
                    var showSubChart = false;

                    if (zoomEnabled) {
                        if (zoom_type == "scroll") {
                            showSubChart = false;
                        } else if (zoom_type == "subchart") {
                            showSubChart = true;
                            zoomEnabled = false;
                        } else if (zoom_type == "drag") {
                            zoomEnabled = {
                                type: "drag"
                            };
                            showSubChart = false;
                        }
                    } else {
                        showSubChart = false;
                    }

                    var zoomRescale = setObjectParameter(pConfigData.zoomRescale, pDefaultConfig.d3chart.zoom.rescale, true);

                    /* Prepare Data for Render */
                    var dataArr = [];
                    var categoriesArr = [];
                    var groupsArr = [];
                    var colorsJSON = {};
                    var typesJSON = {};
                    var axesJSON = {};
                    var namesJSON = {};
                    var groupJSON = {};

                    if (pSeriesData) {
                        /* Add Categories or time values to x Axis when correct type is set */
                        if (xType == "category" || xType == "timeseries") {
                            categoriesArr.push("x");
                            var xCatObj = util.groupObjectArray(pValuesData, "x");
                            var xCatArr = Object.keys(xCatObj);

                            $.each(xCatArr, function (dIdx, dataValues) {
                                categoriesArr.push((setObjectParameter(dataValues, null)));
                            });
                        }

                        dataArr.push(categoriesArr);

                        /* Transform data for billboard.js */
                        $.each(pSeriesData, function (idx, seriesData) {
                            var series;

                            if (seriesData[0] && seriesData[0].seriesID) {
                                series = seriesData[0];
                                var dataKey = $.escapeSelector(series.seriesID);
                                colorsJSON[dataKey] = series.color;
                                typesJSON[dataKey] = series.type;

                                /* check if atypechart*/
                                if (aTypeCharts.indexOf(series.type) >= 0) {
                                    zoomEnabled = false;
                                }

                                if (series.type === "gauge") {
                                    isGauge = true;
                                }

                                if (series.type === "pie") {
                                    isPie = true;
                                }

                                if (series.type === "donut") {
                                    isDonut = true;
                                }

                                if (util.isDefinedAndNotNull(series.tooltip)) {
                                    ownTooltip = true;
                                }

                                axesJSON[dataKey] = (series.yAxis || "y");
                                if (series.groupID) {
                                    var groupID = $.escapeSelector(series.groupID);
                                    if (groupJSON[groupID]) {
                                        groupJSON[groupID].push(dataKey);
                                    } else {
                                        groupJSON[groupID] = [];
                                        groupJSON[groupID].push(dataKey);
                                    }
                                }

                                if (series.yAxis == "y2") {
                                    y2Show = true;
                                }
                                namesJSON[dataKey] = (setObjectParameter(series.label, dataKey));

                                var arr = [];
                                arr.push(dataKey);
                                if (xType == "category" || xType == "timeseries") {
                                    $.each(xCatObj, function (dIdx, dataValues) {
                                        var setValueY = null;
                                        var setValueZ = null;
                                        $.each(dataValues, function (sIDx, sDataValues) {
                                            if ($.escapeSelector(sDataValues.seriesID) == dataKey) {
                                                setValueY = sDataValues.y;
                                                if (sDataValues.z) {
                                                    setValueZ = sDataValues.z;
                                                }
                                            }
                                        });
                                        if (setValueZ !== null) {
                                            arr.push({
                                                "y": setValueY,
                                                "z": setValueZ
                                            });
                                        } else {
                                            arr.push(setValueY);
                                        }
                                    });
                                } else {
                                    $.each(util.groupObjectArray(pValuesData, "seriesID")[dataKey], function (dIdx, dataValues) {
                                        var setValueY = setObjectParameter(dataValues.y, null);
                                        if (dataValues.z) {
                                            var setValueZ = dataValues.z;
                                            arr.push({
                                                "y": setValueY,
                                                "z": setValueZ
                                            });
                                        } else {
                                            arr.push(setValueY);
                                        }
                                    });
                                }

                                dataArr.push(arr);

                            } else {
                                util.errorMessage.show(pItemSel, pDefaultConfig.errorMessage);
                                util.debug.error("No seriesID found in seriesID Cursor");
                            }

                        });

                        /* Group JSON to Array */
                        $.each(groupJSON, function (dIdx, jsonObj) {
                            groupsArr.push(jsonObj);
                        });

                        /* Labels and Datapoints */
                        var dataLabels = setObjectParameter(pConfigData.showDataLabels, pDefaultConfig.d3chart.showDataLabels, true);

                        if (isPie || isDonut) {
                            dataLabels = {
                                colors: "white"
                            };
                        } else if (isGauge) {
                            dataLabels = {
                                colors: (gaugeType === "single") ? "white" : "black"
                            };
                        }
                        var showDataPoints = setObjectParameter(pConfigData.showDataPoints, pDefaultConfig.d3chart.showDataPoints, true);

                        var showAbsoluteValues = setObjectParameter(pConfigData.showAbsoluteValues, pDefaultConfig.d3chart.showAbsoluteValues);
                        var absoluteFormatting;

                        if (showAbsoluteValues) {
                            absoluteFormatting = function (value, ratio, id) {
                                return value + yUnit;
                            }
                        }

                        var ttContent;
                        if (ownTooltip) {
                            ttContent = function (d) {
                                var div = $("<div></div>");
                                div.addClass("bb-tooltip");
                                div.addClass("bida-chart-tooltip-custome");
                                $.each(d, function (i, v) {
                                    if (Object.keys(pSeriesData)[i]) {
                                        var key = Object.keys(pSeriesData)[i];

                                        if (pSeriesData[key][v.index] && util.isDefinedAndNotNull(pSeriesData[key][v.index].tooltip)) {
                                            var ttS = pSeriesData[key][v.index].tooltip;
                                            if (pRequireHTMLEscape !== false) {
                                                ttS = util.escapeHTML(ttS);
                                            }
                                            div.append(ttS);
                                            div.append("<br>");
                                        }
                                    }
                                });

                                return div[0].outerHTML;
                            }
                        }

                        try {
                            var chartContIDSel = pItemSel + "bbc";
                            var chartContID = chartContIDSel.replace("#", "");
                            var shadowID = chartContID + "-shadow";
                            var chartCont = $("<div></div>");
                            chartCont.attr("id", chartContID);

                            $(pItemSel).append(chartCont);

                            var bbData = {
                                bindto: chartContIDSel,
                                size: {
                                    height: pItemHeight
                                },
                                data: {
                                    x: xName,
                                    xFormat: xAxisTimeFormat,
                                    columns: dataArr,
                                    types: typesJSON,
                                    groups: groupsArr,
                                    colors: colorsJSON,
                                    labels: dataLabels,
                                    axes: axesJSON,
                                    names: namesJSON,
                                    onclick: function (d) {
                                        util.debug.info({
                                            "module": "drawChart",
                                            "onclick_element": d
                                        });
                                        executeLink(d.id, d.index);
                                    }
                                },
                                pie: {
                                    label: {
                                        format: absoluteFormatting,
                                        threshold: 0.05
                                    }
                                },
                                donut: {
                                    label: {
                                        format: absoluteFormatting,
                                        threshold: 0.05
                                    }
                                },
                                bar: {
                                    label: {
                                        threshold: 0.05
                                    }
                                },
                                gauge: {
                                    label: {
                                        format: absoluteFormatting,
                                        threshold: (gaugeType === "single") ? 0.05 : null
                                    },
                                    fullCircle: gaugeFullCircle,
                                    min: gaugeMin,
                                    max: gaugeMax,
                                    type: gaugeType,
                                    width: gaugeWidth,
                                    arc: {
                                        minWidth: gaugeArcMinWidth
                                    }
                                },
                                radar: {
                                    direction: {
                                        clockwise: true
                                    }
                                },
                                subchart: {
                                    show: showSubChart
                                },
                                zoom: {
                                    enabled: zoomEnabled,
                                    rescale: zoomRescale
                                },
                                transition: {
                                    duration: transitionDuration
                                },
                                legend: {
                                    show: legendShow,
                                    position: legendPosition
                                },
                                tooltip: {
                                    show: tooltipShow,
                                    grouped: tooltipGrouped,
                                    contents: ttContent
                                },
                                grid: {
                                    x: {
                                        show: gridX,
                                    },
                                    y: {
                                        show: gridY
                                    }
                                },
                                point: {
                                    show: showDataPoints
                                },
                                axis: {
                                    rotated: rotateAxis,
                                    x: {
                                        show: xShow,
                                        label: xLabel,
                                        type: xType,
                                        tick: {
                                            culling: {
                                                max: xTickMaxNumber
                                            },
                                            autorotate: true,
                                            rotate: xTickRotation,
                                            multiline: xTickMultiline,
                                            format: xTickTimeFormat,
                                            fit: true
                                        },
                                        height: heightXAxis
                                    },
                                    y: {
                                        label: yLabel,
                                        type: yType,
                                        max: yMax,
                                        min: yMin,
                                        tick: {
                                            culling: {
                                                max: yCulling
                                            },
                                            format: function (d) {
                                                return d + yUnit
                                            }
                                        }
                                    },
                                    y2: {
                                        show: y2Show,
                                        label: y2Label,
                                        type: y2Type,
                                        max: y2Max,
                                        min: y2Min,
                                        tick: {
                                            culling: {
                                                max: y2Culling
                                            },
                                            format: function (d) {
                                                return d + y2Unit
                                            }
                                        }
                                    }
                                },
                                padding: chartPadding,
                                onrendered: function () {
                                    /* define shadows */
                                    if (shadows) {
                                        var svg = d3.select(chartContIDSel).select("svg");
                                        defineSVGShadows(svg, shadowID, 0, 2, 2);
                                        svg.selectAll(".bb-chart-bar").style("filter", "url(#" + shadowID + ")");
                                        svg.selectAll(".bb-line").style("filter", "url(#" + shadowID + ")");
                                        svg.selectAll(".bb-shape").style("filter", "url(#" + shadowID + ")");
                                    }
                                }
                            };

                            util.debug.info({
                                "module": "drawChart",
                                "finalChartData": bbData
                            });

                            var chart = bb.generate(bbData);

                            /* reset zoom on right click */
                            if (zoomEnabled) {
                                $(chartContIDSel).contextmenu(function (evt) {
                                    evt.preventDefault();
                                    chart.unzoom();
                                });
                            }

                            /* execute resize */
                            function resize() {
                                if (!document.hidden && chartCont.is(":visible")) {
                                    chart.resize({
                                        height: pItemHeight
                                    });
                                }
                            }

                            if (util.isAPEX()) {
                                $(window).on("apexwindowresized", function () {
                                    resize();
                                });

                                /* bind resize events */
                                $("#t_TreeNav").on("theme42layoutchanged", function () {
                                    resize();
                                });

                                /* dirty workaround because in apex sometimes chart renders in wrong size hope apexDev Team will bring us layout change events also for tabs, collapsible so on */
                                function stopResizeWA() {
                                    if (timers.innerItemsIntervals && timers.innerItemsIntervals[pItemSel]) {
                                        clearInterval(timers.innerItemsIntervals[pItemSel]);
                                    }
                                }

                                function startResizeWA() {
                                    timers.innerItemsIntervals[pItemSel] = setInterval(function () {
                                        if ($(pItemSel).length === 0) {
                                            clearInterval(timers.innerItemsIntervals[pItemSel]);
                                        } else {
                                            if (chartCont.is(":visible")) {
                                                if (!util.isBetween(chartCont.width(), chartCont.find("svg").width(), resizeRange)) {
                                                    util.debug.info("Chart has resize problem");
                                                    resize();
                                                }

                                            }
                                        }
                                    }, timers.defTime);
                                }

                                stopResizeWA();
                                startResizeWA();

                                /* stop when tab is not active */
                                document.addEventListener("visibilitychange", function () {
                                    if (document.hidden) {
                                        stopResizeWA();
                                    } else {
                                        startResizeWA();
                                    }
                                });
                            } else {
                                $(window).resize(function () {
                                    resize();
                                });
                            }
                        } catch (e) {
                            $(pItemSel).empty();
                            util.errorMessage.show(pItemSel, pDefaultConfig.errorMessage);
                            util.debug.error({
                                "msg": "Error while try to render chart",
                                "err": e
                            });
                        }
                    } else {
                        util.noDataMessage.show(pItemSel, pDefaultConfig.noDataMessage);
                    }
                } catch (e) {
                    $(pItemSel).empty();
                    util.errorMessage.show(pItemSel, pDefaultConfig.errorMessage);
                    util.debug.error({
                        "msg": "Error while prepare data for chart",
                        "err": e
                    });
                }
            }
            /***********************************************************************
             **
             ** function to get data from APEX
             **
             ***********************************************************************/
            function getData(pDefaultConfig) {
                if (util.isAPEX()) {
                    util.loader.start(parentID);
                    var submitItems = pItems2Submit;

                    apex.server.plugin(
                        pAjaxID, {
                            pageItems: submitItems
                        }, {
                            success: function (pData) {
                                prepareData(pData, pDefaultConfig)
                            },
                            error: function (d) {
                                $(parentID).empty();
                                util.errorMessage.show(parentID, pDefaultConfig.errorMessage);
                                util.debug.error({
                                    "msg": "Error while loading AJAX data",
                                    "err": d
                                });
                                util.loader.stop(parentID);
                                util.debug.error(d.responseText);
                            },
                            dataType: "json"
                        });

                } else if (pData) {
                    prepareData(pData, pDefaultConfig);
                } else {
                    util.errorMessage.show(parentID, pDefaultConfig.errorMessage);
                    util.debug.error({
                        "msg": "No offline Data found or apex and ajax id is unedefined."
                    });
                }
            }
        }
    }
})();
