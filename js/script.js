// eslint-disable-next-line no-unused-vars
const apexDashboardChart = function ( apex, $ ) {
    "use strict";
    const util = {
        featureDetails: {
            name: "APEX-D3Dashboard-Charts",
            scriptVersion: "23.10.22",
            utilVersion: "22.11.28",
            url: "https://github.com/RonnyWeiss",
            url2: "https://ronnyweiss.app",
            license: "MIT License"
        },
        isDefinedAndNotNull: function ( pInput ) {
            if ( typeof pInput !== "undefined" && pInput !== null && pInput !== "" ) {
                return true;
            } else {
                return false;
            }
        },
        groupObjectArray: function ( objectArr, jSONKey ) {
            if ( objectArr && Array.isArray( objectArr ) ) {
                return objectArr.reduce( function ( retVal, x ) {
                    let key = x[jSONKey];
                    if ( key ) {
                        /* workaround for object sort of numbers */
                        key = "\u200b" + key;
                        ( retVal[key] = retVal[key] || [] ).push( x );
                    }
                    return retVal;
                }, {} );
            } else {
                return [];
            }
        },
        link: function ( pLink, pTarget = "_parent" ) {
            if ( typeof pLink !== "undefined" && pLink !== null && pLink !== "" ) {
                window.open( pLink, pTarget );
            }
        },
        escapeHTML: function ( str ) {
            if ( str === null ) {
                return null;
            }
            if ( typeof str === "undefined" ) {
                return;
            }
            if ( typeof str === "object" ) {
                try {
                    str = JSON.stringify( str );
                } catch ( e ) {
                    /*do nothing */
                }
            }
            return apex.util.escapeHTML( String( str ) );
        },
        loader: {
            start: function ( id, setMinHeight ) {
                if ( setMinHeight ) {
                    $( id ).css( "min-height", "100px" );
                }
                apex.util.showSpinner( $( id ) );
            },
            stop: function ( id, removeMinHeight ) {
                if ( removeMinHeight ) {
                    $( id ).css( "min-height", "" );
                }
                $( id + " > .u-Processing" ).remove();
                $( id + " > .ct-loader" ).remove();
            }
        },
        jsonSaveExtend: function ( srcConfig, targetConfig ) {
            let finalConfig = {};
            let tmpJSON = {};
            /* try to parse config json when string or just set */
            if ( typeof targetConfig === 'string' ) {
                try {
                    tmpJSON = JSON.parse( targetConfig );
                } catch ( e ) {
                    apex.debug.error( {
                        "module": "util.js",
                        "msg": "Error while try to parse targetConfig. Please check your Config JSON. Standard Config will be used.",
                        "err": e,
                        "targetConfig": targetConfig
                    } );
                }
            } else {
                tmpJSON = $.extend( true, {}, targetConfig );
            }
            /* try to merge with standard if any attribute is missing */
            try {
                finalConfig = $.extend( true, {}, srcConfig, tmpJSON );
            } catch ( e ) {
                finalConfig = $.extend( true, {}, srcConfig );
                apex.debug.error( {
                    "module": "util.js",
                    "msg": "Error while try to merge 2 JSONs into standard JSON if any attribute is missing. Please check your Config JSON. Standard Config will be used.",
                    "err": e,
                    "finalConfig": finalConfig
                } );
            }
            return finalConfig;
        },
        printDOMMessage: {
            show: function ( id, text, icon, color ) {
                const div =$( "<div>" );
                if ( $( id ).height() >= 150 ) {
                    const subDiv = $( "<div></div>" );
    
                    const iconSpan = $( "<span></span>" )
                        .addClass( "fa" )
                        .addClass( icon || "fa-info-circle-o" )
                        .addClass( "fa-2x" )
                        .css( "height", "32px" )
                        .css( "width", "32px" )
                        .css( "margin-bottom", "16px" )
                        .css( "color", color || "#D0D0D0" );
    
                    subDiv.append( iconSpan );
    
                    const textSpan = $( "<span></span>" )
                        .text( text )
                        .css( "display", "block" )
                        .css( "color", "#707070" )
                        .css( "text-overflow", "ellipsis" )
                        .css( "overflow", "hidden" )
                        .css( "white-space", "nowrap" )
                        .css( "font-size", "12px" );
    
                    div
                        .css( "margin", "12px" )
                        .css( "text-align", "center" )
                        .css( "padding", "10px 0" )
                        .addClass( "dominfomessagediv" )
                        .append( subDiv )
                        .append( textSpan );
                } else {  
                    const iconSpan = $( "<span></span>" )
                        .addClass( "fa" )
                        .addClass( icon || "fa-info-circle-o" )
                        .css( "font-size", "22px" )
                        .css( "line-height", "26px" )
                        .css( "margin-right", "5px" )
                        .css( "color", color || "#D0D0D0" );
    
                    const textSpan = $( "<span></span>" )
                        .text( text )
                        .css( "color", "#707070" )
                        .css( "text-overflow", "ellipsis" )
                        .css( "overflow", "hidden" )
                        .css( "white-space", "nowrap" )
                        .css( "font-size", "12px" )
                        .css( "line-height", "20px" );
    
                    div
                        .css( "margin", "10px" )
                        .css( "text-align", "center" )
                        .addClass( "dominfomessagediv" )
                        .append( iconSpan )
                        .append( textSpan );
                }
                $( id ).append( div );
            },
            hide: function ( id ) {
                $( id ).children( '.dominfomessagediv' ).remove();
            }
        },
        noDataMessage: {
            show: function ( id, text ) {
                util.printDOMMessage.show( id, text, "fa-search" );
            },
            hide: function ( id ) {
                util.printDOMMessage.hide( id );
            }
        },
        errorMessage: {
            show: function ( id, text ) {
                util.printDOMMessage.show( id, text, "fa-exclamation-triangle", "#FFCB3D" );
            },
            hide: function ( id ) {
                util.printDOMMessage.hide( id );
            }
        },
        cutString: function ( text, textLength ) {
            try {
                if ( textLength < 0 ) {return text;}
                else {
                    return ( text.length > textLength ) ?
                        text.substring( 0, textLength - 3 ) + "..." :
                        text;
                }
            } catch ( e ) {
                return text;
            }
        },
        isBetween: function ( pValue, pValue2, pRange ) {
            const range = pRange || 0,
                  min = pValue2 - range,
                  max = pValue2 + range;
            return ( pValue >= min && pValue <= max );
        }
    };

    /***********************************************************************
     **
     ** Used to set parameter from data or from config 
     **
     ***********************************************************************/
    function setObjectParameter( srcValue, cfgValue, convData2Bool ) {
        if ( convData2Bool ) {
            if ( typeof srcValue !== "undefined" && srcValue != null ) {
                if ( srcValue === 1 || srcValue === 'true' ) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return cfgValue;
            }
        } else {
            if ( util.isDefinedAndNotNull( srcValue ) ) {
                return srcValue;
            } else {
                return cfgValue;
            }
        }
    }

    return {
        initialize: function ( pRegionID, pAjaxID, pNoDataMsg, pErrorMsg, pDefaultConfigJSON, pChartConfigJSON, pItems2Submit, pRequireHTMLEscape ) {
            var timers = {};

            /* this default json is used if something is missing in cofig */
            var stdConfigJSON = {
                "colSpan": 12,
                "height": 400,
                "refresh": 0
            };

            /* default d3 billboard charts options */
            var stdChartConfigJSON = {
                "axisLabelPosition": "inner3",
                "background": null,
                "chartTitle": null,
                "gauge": {
                    "min": 0,
                    "max": null,
                    "type": "single",
                    "width": null,
                    "arcMinWidth": null,
                    "fullCircle": false,
                    "title": null,
                    "axisLabels": true
                },
                "grid": {
                    "x": true,
                    "y": true
                },
                "legend": {
                    "position": "right",
                    "show": true
                },
                "line": {
                    "step": "step"
                },
                "padding": {
                    "bottom": null,
                    "left": null,
                    "right": null,
                    "top": null
                },
                "rotateAxis": false,
                "showDataLabels": false,
                "showDataPoints": true,
                "showAbsoluteValues": false,
                "threshold": 0.05,
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
                        "autoRotate": true,
                        "timeFormat": "%y-%m-%d %H:%M",
                        "fit": true
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
            var parent = $( parentID ).find( ".d3dc-root" );
            apex.debug.info( {
                "fct": `${util.featureDetails.name} - initialize`,
                "msg": "Load...",
                "featureDetails": util.featureDetails
            } );
            if ( parentID ) {
                if ( parent.length > 0 ) {
                    var configJSON = {};
                    var chartConfigJSON = {};
                    configJSON = util.jsonSaveExtend( stdConfigJSON, pDefaultConfigJSON );

                    chartConfigJSON = util.jsonSaveExtend( stdChartConfigJSON, pChartConfigJSON );

                    configJSON.d3JSchart = chartConfigJSON;

                    configJSON.noDataMessage = pNoDataMsg;
                    configJSON.errorMessage = pErrorMsg;

                    /* define container and add it to parent */
                    let container = drawContainer( parent );

                    /* get data and draw */
                    getData( configJSON, container );

                    /* try to bind APEX refreh event if "APEX" exists */
                    try {
                        $( parentID ).bind( "apexrefresh", function () {
                            getData( configJSON, container );
                        } );
                    } catch ( e ) {
                        util.errorMessage.show( parentID, configJSON.errorMessage );
                        apex.debug.error( {
                            "fct": `${util.featureDetails.name} - initialize`,
                            "msg": "Can't bind refresh event on " + parentID + ". Apex is missing",
                            "err": e,
                            "featureDetails": util.featureDetails
                        } );
                    }

                    /* Used to set a refresh via json configuration */
                    if ( configJSON.refresh > 0 ) {
                        setInterval( function () {
                            if ( $( parentID ).is( ':visible' ) ) {
                                getData( configJSON );
                            }
                        }, configJSON.refresh * 1000 );
                    }
                } else {
                    apex.debug.error( {
                        "fct": `${util.featureDetails.name} - initialize`,
                        "msg": "Can't find element with class d3dc-root in element with id: " + pRegionID,
                        "featureDetails": util.featureDetails
                    } );
                }
            } else {
                apex.debug.error( {
                    "fct": `${util.featureDetails.name} - initialize`,
                    "msg": "Can't find pRegionID: " + pRegionID,
                    "featureDetails": util.featureDetails
                } );
            }
            /***********************************************************************
             **
             ** Used to draw a container
             **
             ***********************************************************************/
            function drawContainer( pParent ) {
                var div = $( "<div></div>" );
                div.addClass( "d3dc-container" );
                div.attr( "id", pRegionID + "-c" );
                div.css( "min-height", "100px" );
                pParent.append( div );
                return ( div );
            }

            /************************************************************************
             **
             ** Used to prepare Data from ajax
             **
             ***********************************************************************/
            function prepareData( pAjaxResponse, pDefaultConfig, pContainer ) {
                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - prepareData`,
                    "msg": "AJAX Finished",
                    "pAjaxResponse": pAjaxResponse,
                    "featureDetails": util.featureDetails
                } );

                /* clear timers */
                if ( timers.innerItemsIntervals ) {
                    $.each( timers.innerItemsIntervals, function ( key, val ) {
                        clearInterval( val );
                    } );
                }
                timers.innerItemsIntervals = {};

                /* empty container for new stuff */
                pContainer.empty();
                /* draw charts and add it to the container */
                if ( pAjaxResponse.items && pAjaxResponse.items.length > 0 ) {
                    try {
                        let row = drawRow( pContainer ),
                            chartNum = 0,
                            itemConfigJSON;

                        $.each( pAjaxResponse.items, function ( idx, item ) {
                            if ( item.itemConfig ) {
                                itemConfigJSON = item.itemConfig;
                            } else {
                                itemConfigJSON = {};
                            }

                            var colSpan = item.colSpan || pDefaultConfig.colSpan;
                            chartNum = chartNum + colSpan;
                            /* draw each chart in a col */
                            apex.debug.info( {
                                "fct": `${util.featureDetails.name} - prepareData`,
                                "msg": "Render chart  - Col " + idx,
                                "featureDetails": util.featureDetails
                            } );

                            var height = item.height || pDefaultConfig.height;

                            drawChartCol( idx, height, row, colSpan, item.title, itemConfigJSON, pDefaultConfig, item.itemData, pContainer );

                            if ( chartNum >= 12 ) {
                                row = drawRow( pContainer );
                                chartNum = 0;
                            }

                        } );
                    } catch ( e ) {
                        util.errorMessage.show( pContainer, pDefaultConfig.errorMessage );
                        apex.debug.error( {
                            "fct": `${util.featureDetails.name} - prepareData`,
                            "msg": "Error while prepare data for chart",
                            "err": e,
                            "featureDetails": util.featureDetails
                        } );
                    }
                } else {
                    pContainer.css( "min-height", "" );
                    util.noDataMessage.show( pContainer, pDefaultConfig.noDataMessage );
                }
                util.loader.stop( parentID );
                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - prepareData`,
                    "msg": "Finished",
                    "featureDetails": util.featureDetails
                } );
            }

            /***********************************************************************
             **
             ** Used to draw a row
             **
             ***********************************************************************/
            function drawRow( pParent ) {
                var div = $( "<div></div>" );
                div.addClass( "d3dc-row" );
                pParent.append( div );
                return ( div );
            }

            /***********************************************************************
             **
             ** Used to draw one chart column
             **
             ***********************************************************************/
            function drawChartCol( pColIndex, pHeight, pParent, pColSpan, pTitle, pItemConfig, pDefaultConfig, pItemData, pContainer ) {
                var colID = pRegionID + "-c-" + pColIndex;

                /* define new column for rows */
                var col = $( "<div></div>" );
                col.attr( "id", colID );
                col.addClass( "d3dc-col-" + pColSpan );
                col.addClass( "d3chartcol" );
                pParent.append( col );

                if ( pItemData ) {
                    drawChart( "#" + colID, pHeight, pItemConfig, pItemData, pDefaultConfig, pContainer );
                } else {
                    util.noDataMessage.show( col, pDefaultConfig.noDataMessage );
                }

                if ( util.isDefinedAndNotNull( pTitle ) ) {
                    var title = $( "<h4></h4>" );
                    title.css( "text-align", "center" );
                    if ( pRequireHTMLEscape !== false ) {
                        title.text( pTitle );
                    } else {
                        title.html( pTitle );
                    }

                    col.prepend( title );
                }
            }

            /***********************************************************************
             **
             ** function to render chart
             **
             ***********************************************************************/
            function drawChart( pItemSel, pItemHeight, pConfigData, pValuesData, pDefaultConfig, pContainer ) {

                apex.debug.info( {
                    "fct": `${util.featureDetails.name} - drawChart`,
                    "pItemSel": pItemSel,
                    "pItemHeight": pItemHeight,
                    "pConfigData": pConfigData,
                    "pValuesData": pValuesData,
                    "pDefaultConfig": pDefaultConfig,
                    "featureDetails": util.featureDetails
                } );

                // eslint-disable-next-line no-undef
                const d3JS = d3;

                const aTypeCharts = ["pie", "donut", "gauge"],
                      specialStr = "\u200b",
                      seriesData = util.groupObjectArray( pValuesData, 'seriesID' );

                let isGauge = false,
                    isPie = false,
                    isDonut = false;

                // sort pValuesData by Time
                function sortArrByTime( pArr, pFormat ) {

                    function customeSort( pFirstValue, pSecondValue ) {
                        const parseTime = d3JS.timeParse( pFormat ),
                              fD = parseTime( pFirstValue.x ),
                              sD = parseTime( pSecondValue.x );
                        return new Date( fD ).getTime() - new Date( sD ).getTime();
                    }

                    try {
                        return pArr.sort( customeSort );
                    }
                    catch ( e ) {
                        apex.debug.error( {
                            "fct": `${util.featureDetails.name} - drawChart`,
                            "msg": "Error while try sort JSON Array by Time Value",
                            "err": e,
                            "featureDetails": util.featureDetails
                        } );
                    }
                }

                /* search link from data and set window.location.href */
                function executeLink( pData ) {
                    const key = specialStr + unescape( pData.id );
                    let index = pData.index;

                    if ( seriesData[key] ) {
                        const seriesObj = seriesData[key];
                        if ( seriesObj.length === 1 ) {
                            index = 0;
                        }

                        if ( seriesData[key][index] && seriesData[key][index].link ) {
                            util.link( seriesData[key][index].link, seriesData[key][index].linkTarget );
                        }
                    }
                }

                try {
                    const chartTitle = setObjectParameter( pConfigData.chartTitle, pDefaultConfig.d3JSchart.chartTitle || "" ).toString(),
                          background = setObjectParameter( pConfigData.background, pDefaultConfig.d3JSchart.background );
                    let backJSON = null,
                        ownTooltip = false;

                    if ( util.isDefinedAndNotNull( background ) ) {
                        backJSON = {
                            color: background
                        };
                    }

                    /* line */
                    const lineStep = setObjectParameter( pConfigData.lineStep, pDefaultConfig.d3JSchart.line.step );

                    /* gauge */
                    const gaugeMin = setObjectParameter( pConfigData.gaugeMin, pDefaultConfig.d3JSchart.gauge.min ),
                          gaugeMax = setObjectParameter( pConfigData.gaugeMax, pDefaultConfig.d3JSchart.gauge.max ),
                          gaugeType = setObjectParameter( pConfigData.gaugeType, pDefaultConfig.d3JSchart.gauge.type ),
                          gaugeWidth = setObjectParameter( pConfigData.gaugeWidth, pDefaultConfig.d3JSchart.gauge.width ),
                          gaugeArcMinWidth = setObjectParameter( pConfigData.gaugeArcMinWidth, pDefaultConfig.d3JSchart.gauge.arcMinWidth ),
                          gaugeFullCircle = setObjectParameter( pConfigData.gaugeFullCircle, pDefaultConfig.d3JSchart.gauge.fullCircle, true ),
                          gaugeAxisLabels = setObjectParameter( pConfigData.gaugeAxisLabels, pDefaultConfig.d3JSchart.gauge.axisLabels, true ),
                          gaugeTitle = setObjectParameter( pConfigData.gaugeTitle, pDefaultConfig.d3JSchart.gauge.title || "" ).toString();

                    /* Grid */
                    const gridX = setObjectParameter( pConfigData.gridX, pDefaultConfig.d3JSchart.grid.x, true ),
                          gridY = setObjectParameter( pConfigData.gridY, pDefaultConfig.d3JSchart.grid.y, true );

                    /* heights */
                    const heightXAxis = setObjectParameter( pConfigData.xAxisHeight, pDefaultConfig.d3JSchart.x.axisHeight );

                    /* Legend */
                    const legendShow = setObjectParameter( pConfigData.legendShow, pDefaultConfig.d3JSchart.legend.show, true ),
                          legendPosition = setObjectParameter( pConfigData.legendPosition, pDefaultConfig.d3JSchart.legend.position );

                    /* padding */
                    const chartPadding = util.jsonSaveExtend( null, pDefaultConfig.d3JSchart.padding );

                    if ( util.isDefinedAndNotNull( pConfigData.paddingBottom ) ) {
                        chartPadding.bottom = pConfigData.paddingBottom;
                    }

                    if ( util.isDefinedAndNotNull( pConfigData.paddingLeft ) ) {
                        chartPadding.left = pConfigData.paddingLeft;
                    }

                    if ( util.isDefinedAndNotNull( pConfigData.paddingRight ) ) {
                        chartPadding.right = pConfigData.paddingRight;
                    }

                    if ( util.isDefinedAndNotNull( pConfigData.paddingTop ) ) {
                        chartPadding.top = pConfigData.paddingTop;
                    }

                    /* Axis */
                    const rotateAxis = setObjectParameter( pConfigData.rotateAxis, pDefaultConfig.d3JSchart.rotateAxis, true ),
                          axisLabelPosition = setObjectParameter( pConfigData.axisLabelPosition, pDefaultConfig.d3JSchart.axisLabelPosition );

                    let xAxisLabelPosition = null,
                        yAxisLabelPosition = null;

                    switch ( axisLabelPosition ) {
                    case "inner1":
                        xAxisLabelPosition = "inner-left";
                        yAxisLabelPosition = "inner-bottom";
                        break;
                    case "inner2":
                        xAxisLabelPosition = "inner-center";
                        yAxisLabelPosition = "inner-middle";
                        break;
                    case "inner3":
                        xAxisLabelPosition = "inner-right";
                        yAxisLabelPosition = "inner-top";
                        break;
                    case "outer1":
                        xAxisLabelPosition = "outer-left";
                        yAxisLabelPosition = "outer-bottom";
                        break;
                    case "outer2":
                        xAxisLabelPosition = "outer-center";
                        yAxisLabelPosition = "outer-middle";
                        break;
                    case "outer3":
                        xAxisLabelPosition = "outer-right";
                        yAxisLabelPosition = "outer-top";
                        break;
                    default:
                        break;
                    }

                    if ( rotateAxis ) {
                        const xAxisLabelPositionTmp = xAxisLabelPosition;
                        xAxisLabelPosition = yAxisLabelPosition;
                        yAxisLabelPosition = xAxisLabelPositionTmp;
                    }

                    /* tooltip */
                    const tooltipShow = setObjectParameter( pConfigData.tooltipShow, pDefaultConfig.d3JSchart.tooltip.show, true ),
                          tooltipGrouped = setObjectParameter( pConfigData.tooltipGrouped, pDefaultConfig.d3JSchart.tooltip.grouped, true );

                    /* Transition duration */
                    const transitionDuration = setObjectParameter( pConfigData.transitionDuration || pDefaultConfig.d3JSchart.transitionDuration );

                    /* x Axis */
                    const xShow = setObjectParameter( pConfigData.xShow, pDefaultConfig.d3JSchart.x.show, true ),
                          xLabel = setObjectParameter( pConfigData.xLabel, pDefaultConfig.d3JSchart.x.label || "" ).toString();
                    let xType = setObjectParameter( pConfigData.xType, pDefaultConfig.d3JSchart.x.type ),
                        xAxisTimeFormat = null,
                        xName = null;

                    /* x ticks */
                    const xTickCutAfter = setObjectParameter( pConfigData.xTickCutAfter, pDefaultConfig.d3JSchart.x.tick.cutAfter ),
                          xTickMaxNumber = setObjectParameter( pConfigData.xTickMaxNumber, pDefaultConfig.d3JSchart.x.tick.maxNumber ),
                          xTickRotation = setObjectParameter( pConfigData.xTickRotation, pDefaultConfig.d3JSchart.x.tick.rotation ),
                          xTickMultiline = setObjectParameter( pConfigData.xTickMultiline, pDefaultConfig.d3JSchart.x.tick.multiline, true ),
                          xTickFit = setObjectParameter( pConfigData.xTickFit, pDefaultConfig.d3JSchart.x.tick.fit, true ),
                          xTickAutoRotate = setObjectParameter( pConfigData.xTickAutoRotate, pDefaultConfig.d3JSchart.x.tick.autoRotate, true );
                    let xTickTimeFormat = null;

                    if ( xType === "category" || xType === "timeseries" ) {
                        xName = "x";
                    }

                    if ( xType === "timeseries" ) {
                        xAxisTimeFormat = setObjectParameter( pConfigData.xTimeFormat, pDefaultConfig.d3JSchart.x.timeFormat );
                        xTickTimeFormat = setObjectParameter( pConfigData.xTickTimeFormat, pDefaultConfig.d3JSchart.x.tick.timeFormat );
                        // sort data because of tooltip index
                        sortArrByTime( pValuesData, xAxisTimeFormat );
                    }

                    /* cut string if category names are to long */
                    if ( xType === "category" ) {
                        xTickTimeFormat = function ( index, categoryName ) {
                            return util.cutString( categoryName, xTickCutAfter );
                        };
                    }

                    /* y Axis */
                    const yLabel = setObjectParameter( pConfigData.yLabel, pDefaultConfig.d3JSchart.y.label || "" ).toString(),
                          yLog = setObjectParameter( pConfigData.yLog, pDefaultConfig.d3JSchart.y.log, true );
                    let yType = null;
                    if ( yLog ) {
                        yType = "log";
                    }
                    const yMin = pConfigData.yMin || pDefaultConfig.d3JSchart.y.min,
                          yMax = pConfigData.yMax || pDefaultConfig.d3JSchart.y.max,
                          yCulling = pConfigData.yTickMaxNumber || pDefaultConfig.d3JSchart.y.tick.maxNumber,
                          yUnit = pConfigData.yUnit || pDefaultConfig.d3JSchart.y.unit;

                    /* y2 Axis */
                    const y2Label = setObjectParameter( pConfigData.y2Label, pDefaultConfig.d3JSchart.y2.label || "" ).toString(),
                          y2Log = setObjectParameter( pConfigData.y2Log, pDefaultConfig.d3JSchart.y2.log, true );
                    let y2Type = null,
                        y2Show = false;
                    if ( y2Log ) {
                        y2Type = "log";
                    }
                    const y2Min = setObjectParameter( pConfigData.y2Min, pDefaultConfig.d3JSchart.y2.min ),
                          y2Max = setObjectParameter( pConfigData.y2Max, pDefaultConfig.d3JSchart.y2.max ),
                          y2Culling = setObjectParameter( pConfigData.y2TickMaxNumber, pDefaultConfig.d3JSchart.y2.tick.maxNumber ),
                          y2Unit = setObjectParameter( pConfigData.y2Unit, pDefaultConfig.d3JSchart.y2.unit );

                    /* Zoom and Subchart */
                    const zoomType = setObjectParameter( pConfigData.zoomType, pDefaultConfig.d3JSchart.zoom.type );
                    let showSubChart = false,
                        zoomEnabled = setObjectParameter( pConfigData.zoomEnabled, pDefaultConfig.d3JSchart.zoom.enabled, true );

                    const charThreshold = setObjectParameter( pConfigData.threshold, pDefaultConfig.d3JSchart.threshold );

                    if ( zoomEnabled ) {
                        if ( zoomType === "scroll" ) {
                            showSubChart = false;
                        } else if ( zoomType === "subchart" ) {
                            showSubChart = true;
                            zoomEnabled = false;
                        } else if ( zoomType === "drag" ) {
                            zoomEnabled = true;
                            showSubChart = false;
                        }
                    } else {
                        showSubChart = false;
                    }

                    const zoomRescale = setObjectParameter( pConfigData.zoomRescale, pDefaultConfig.d3JSchart.zoom.rescale, true );

                    /* Prepare Data for Render */
                    const dataArr = [],
                          categoriesArr = [],
                          groupsArr = [],
                          colorsJSON = {},
                          typesJSON = {},
                          axesJSON = {},
                          namesJSON = {},
                          groupJSON = {},
                          xCatObj = util.groupObjectArray( pValuesData, "x" );

                    let seriesCnt = 0;

                    if ( seriesData ) {
                        /* Add Categories or time values to x Axis when correct type is set */
                        if ( xType === "category" || xType === "timeseries" ) {
                            categoriesArr.push( "x" );
                            const xCatArr = Object.keys( xCatObj );

                            $.each( xCatArr, function ( dIdx, dataValues ) {
                                categoriesArr.push( ( setObjectParameter( dataValues.replace( specialStr, "" ), null ) ) );
                            } );
                        }

                        dataArr.push( categoriesArr );

                        /* Transform data for billboard.js */
                        $.each( seriesData, function ( idx, seriesData ) {
                            let series;
                            seriesCnt += 1;
                            if ( seriesData[0] && seriesData[0].seriesID ) {
                                series = seriesData[0];
                                const dataKey = escape( series.seriesID );
                                colorsJSON[dataKey] = series.color;
                                typesJSON[dataKey] = series.type;

                                /* check if atypechart*/
                                if ( aTypeCharts.indexOf( series.type ) >= 0 ) {
                                    zoomEnabled = false;
                                }

                                if ( series.type === "gauge" ) {
                                    isGauge = true;
                                }

                                if ( series.type === "pie" ) {
                                    isPie = true;
                                }

                                if ( series.type === "donut" ) {
                                    isDonut = true;
                                }

                                if ( util.isDefinedAndNotNull( series.tooltip ) ) {
                                    ownTooltip = true;
                                }

                                axesJSON[dataKey] = ( series.yAxis || "y" );
                                if ( util.isDefinedAndNotNull( series.groupID ) ) {
                                    const groupID = escape( series.groupID.toString() );
                                    if ( groupJSON[groupID] ) {
                                        groupJSON[groupID].push( dataKey );
                                    } else {
                                        groupJSON[groupID] = [];
                                        groupJSON[groupID].push( dataKey );
                                    }
                                }

                                if ( series.yAxis === "y2" ) {
                                    y2Show = true;
                                }
                                namesJSON[dataKey] = ( setObjectParameter( series.label, dataKey ) );

                                const arr = [];
                                arr.push( dataKey );
                                if ( xType === "category" || xType === "timeseries" ) {
                                    $.each( xCatObj, function ( dIdx, dataValues ) {
                                        let setValueY = null,
                                            setValueZ = null;
                                        $.each( dataValues, function ( sIDx, sDataValues ) {
                                            if ( escape( sDataValues.seriesID ) === dataKey ) {
                                                setValueY = sDataValues.y;
                                                if ( sDataValues.z ) {
                                                    setValueZ = sDataValues.z;
                                                }
                                            }
                                        } );
                                        if ( setValueZ !== null ) {
                                            arr.push( {
                                                "y": setValueY,
                                                "z": setValueZ
                                            } );
                                        } else {
                                            arr.push( setValueY );
                                        }
                                    } );
                                } else {
                                    $.each( seriesData, function ( dIdx, dataValues ) {
                                        const setValueY = setObjectParameter( dataValues.y, null );
                                        if ( dataValues.z ) {
                                            const setValueZ = dataValues.z;
                                            arr.push( {
                                                "y": setValueY,
                                                "z": setValueZ
                                            } );
                                        } else {
                                            arr.push( setValueY );
                                        }
                                    } );
                                }

                                dataArr.push( arr );

                            } else {
                                util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                                apex.debug.error( {
                                    "fct": `${util.featureDetails.name} - drawChart`,
                                    "msg": "No seriesID found in seriesID Cursor",
                                    "featureDetails": util.featureDetails
                                } );
                            }

                        } );

                        /* Group JSON to Array */
                        $.each( groupJSON, function ( dIdx, jsonObj ) {
                            groupsArr.push( jsonObj );
                        } );

                        /* Labels and Datapoints */
                        let dataLabels = setObjectParameter( pConfigData.showDataLabels, pDefaultConfig.d3JSchart.showDataLabels, true );

                        if ( isPie || isDonut ) {
                            dataLabels = {
                                colors: "white"
                            };
                        } else if ( isGauge ) {
                            dataLabels = {
                                colors: ( gaugeType === "single" && seriesCnt > 1 ) ? "white" : null
                            };
                        }
                        const showDataPoints = setObjectParameter( pConfigData.showDataPoints, pDefaultConfig.d3JSchart.showDataPoints, true ),
                              showAbsoluteValues = setObjectParameter( pConfigData.showAbsoluteValues, pDefaultConfig.d3JSchart.showAbsoluteValues );
                        let absoluteFormatting;

                        if ( showAbsoluteValues ) {
                            absoluteFormatting = function ( value ) {
                                return value + yUnit;
                            };
                        }

                        let ttContent;
                        if ( ownTooltip ) {
                            ttContent = function ( d ) {
                                const div = $( "<div></div>" );
                                div.addClass( "bb-tooltip" );
                                div.addClass( "bida-chart-tooltip-custome" );
                                $.each( d, function ( i, pData ) {
                                    const key = specialStr + unescape( pData.id ),
                                          seriesObj = seriesData[key],
                                          index = pData.index;
                                    
                                    if ( seriesObj && seriesObj[index] && util.isDefinedAndNotNull( seriesObj[index].tooltip ) && util.isDefinedAndNotNull( pData.value ) ) {
                                        const subDiv = $( "<div>" );

                                        let ttS = seriesObj[index].tooltip;
                                        if ( pRequireHTMLEscape !== false ) {
                                            ttS = util.escapeHTML( ttS );
                                        }
                                        subDiv.append( ttS );
                                        div.append( subDiv );
                                    }
                                } );
                                return div[0].outerHTML;
                            };
                        }

                        try {
                            const chartContIDSel = pItemSel + "bbc",
                                  chartContID = chartContIDSel.replace( "#", "" ),
                                  chartCont = $( "<div></div>" );
                            chartCont.attr( "id", chartContID );

                            $( pItemSel ).append( chartCont );

                            const bbData = {
                                bindto: chartContIDSel,
                                background: backJSON,
                                title: {
                                    text: chartTitle
                                },
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
                                    onclick: function ( pData ) {
                                        executeLink( pData );
                                    }
                                },
                                pie: {
                                    label: {
                                        format: absoluteFormatting,
                                        threshold: charThreshold
                                    }
                                },
                                donut: {
                                    label: {
                                        format: absoluteFormatting,
                                        threshold: charThreshold
                                    }
                                },
                                line: {
                                    step: {
                                        type: lineStep
                                    }
                                },
                                gauge: {
                                    label: {
                                        format: absoluteFormatting,
                                        threshold: charThreshold,
                                        extents: function( d ) {
                                            return gaugeAxisLabels ? d : null;
                                        }
                                    },
                                    fullCircle: gaugeFullCircle,
                                    min: gaugeMin,
                                    max: gaugeMax,
                                    type: gaugeType,
                                    width: gaugeWidth,
                                    title: gaugeTitle,
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
                                    type: zoomType,
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
                                        label: {
                                            text: xLabel,
                                            position: xAxisLabelPosition
                                        },
                                        type: xType,
                                        tick: {
                                            culling: {
                                                max: xTickMaxNumber
                                            },
                                            autorotate: xTickAutoRotate,
                                            rotate: xTickRotation,
                                            multiline: xTickMultiline,
                                            format: xTickTimeFormat,
                                            fit: xTickFit
                                        },
                                        height: heightXAxis
                                    },
                                    y: {
                                        label: {
                                            text: yLabel,
                                            position: yAxisLabelPosition
                                        },
                                        type: yType,
                                        max: yMax,
                                        min: yMin,
                                        tick: {
                                            culling: {
                                                max: yCulling
                                            },
                                            format: function ( d ) {
                                                return d + yUnit;
                                            }
                                        }
                                    },
                                    y2: {
                                        show: y2Show,
                                        label: {
                                            text: y2Label,
                                            position: yAxisLabelPosition
                                        },
                                        type: y2Type,
                                        max: y2Max,
                                        min: y2Min,
                                        tick: {
                                            culling: {
                                                max: y2Culling
                                            },
                                            format: function ( d ) {
                                                return d + y2Unit;
                                            }
                                        }
                                    }
                                },
                                padding: chartPadding
                            };

                            apex.debug.info( {
                                "fct": `${util.featureDetails.name} - drawChart`,
                                "finalChartData": bbData,
                                "featureDetails": util.featureDetails
                            } );

                            // eslint-disable-next-line no-undef
                            const chart = bb.generate( bbData );

                            /* reset zoom on right click */
                            if ( zoomEnabled ) {
                                $( chartContIDSel ).contextmenu( function ( evt ) {
                                    evt.preventDefault();
                                    chart.unzoom();
                                } );
                            }

                            /* execute resize */
                            pContainer.on( "resize", function() {
                                chart.resize( {
                                    height: pItemHeight
                                } );
                            } );

                        } catch ( e ) {
                            $( pItemSel ).empty();
                            util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                            apex.debug.error( {
                                "fct": `${util.featureDetails.name} - drawChart`,
                                "msg": "Error while try to render chart",
                                "err": e,
                                "featureDetails": util.featureDetails
                            } );
                        }
                    } else {
                        util.noDataMessage.show( pItemSel, pDefaultConfig.noDataMessage );
                    }
                } catch ( e ) {
                    $( pItemSel ).empty();
                    util.errorMessage.show( pItemSel, pDefaultConfig.errorMessage );
                    apex.debug.error( {
                        "fct": `${util.featureDetails.name} - drawChart`,
                        "msg": "Error while prepare data for chart",
                        "err": e,
                        "featureDetails": util.featureDetails
                    } );
                }
            }
            /***********************************************************************
             **
             ** function to get data from APEX
             **
             ***********************************************************************/
            function getData( pDefaultConfig, pContainer ) {
                util.loader.start( parentID );
                var submitItems = pItems2Submit;

                apex.server.plugin(
                    pAjaxID, {
                        pageItems: submitItems
                    }, {
                        success: function ( pData ) {
                            prepareData( pData, pDefaultConfig, pContainer );
                        },
                        error: function ( d ) {
                            $( parentID ).empty();
                            util.errorMessage.show( parentID, pDefaultConfig.errorMessage );
                            apex.debug.error( {
                                "fct": `${util.featureDetails.name} - getData`,
                                "msg": "Error while loading AJAX data",
                                "err": d,
                                "featureDetails": util.featureDetails
                            } );
                            util.loader.stop( parentID );
                        },
                        dataType: "json"
                    } );
            }
        }
    };
};
