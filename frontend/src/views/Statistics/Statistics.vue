<template>
    <div class="outputpdf-body" v-loading="loading">
        <div class="pdf-ctn">
            <div class="pdf-panel" v-if="runningReportData">
                <!--	首页	-->
                <div class="a4main">
                    <div class="title">{{ $t('message.platformStatistics') }}</div>
                    <div class="table">
                        <div class="tr">
                            <div class="td">{{ $t('message.userID') }}</div>
                            <div class="td" id="a4Report"></div>
                        </div>
                        <div class="tr">
                            <div class="td">{{ $t('message.exportUsers') }}</div>
                            <div class="td" id="companyName"></div>
                        </div>
                        <div class="tr">
                            <div class="td">{{ $t('message.time') }}</div>
                            <div class="td" id="a4Date"></div>
                        </div>
                    </div>
                </div>
                <!-- 分页 -->
                <div class="page-skip"></div>
                
                <!--	声明页面	-->
                <div class="statement">
                    <div class="title">
                        声明
                    </div>
                    <div class="content">
                        本报告版权仅为本平台所有，未经事先书面许可，任何机构和个人不得以任何形式翻版、复制、发表、转发或引用本报告的任何部分。如征得本平台同意进行引用、刊发的，需在允许的范围内使用，并注明出处为“苏富必艺术品竞拍平台”，且不得对本报告进行任何有悖原意的引用、删节和修改。
                    </div>
                    <div class="title title2">
                        STATEMENT
                    </div>
                    <div class="content content2">
                        The copyright of this report belongs only to this platform. No organization or individual may reproduce, copy, publish, forward or quote any part of this report in any form without prior written permission. If you obtain the consent of this platform for quoting or publishing, you must use it within the permitted scope and indicate the source as "Sotheby's Art Auction Platform". This report must not be quoted, abridged or reproduced in any way that goes against the original intention. Revise.
                    </div>
                </div>
                <!-- 分页 -->
                <div class="page-skip"></div>

                <!-- 拍卖信息汇总 -->
                <div id="deviceInfos" class="allInfo">
                    <h3 style="color: black">{{ $t('message.categories') }}</h3>
                    <table class="deviceInfos-table">
                        <thead>
                            <tr>
                                <th colspan="2" style="font-weight: 500;">{{ $t('message.artworkClassification') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="basics-tr" v-for="(item, index) in typeList">
                                <td>{{ $t('message.category') }}{{index + 1}}</td>
                                <td>{{ localizeCategory(item) }}</td>
                            </tr>
                        </tbody>
                        <thead>
                            <tr>
                                <th colspan="2" style="font-weight: 500;">{{ $t('message.categoryClassification') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="basics-tr">
                                <td>{{ $t('message.category') }}1</td>
                                <td>{{ $t('message.auctionSuc') }}</td>
                            </tr>
                            <tr class="basics-tr">
                                <td>{{ $t('message.category') }}2</td>
                                <td>{{ $t('message.unsold') }}</td>
                            </tr>
                            <tr class="basics-tr">
                                <td>{{ $t('message.category') }}3</td>
                                <td>{{ $t('message.reservePrice') }}</td>
                            </tr>
                        </tbody>
                        <thead>
                            <tr>
                                <th colspan="2" style="font-weight: 500;">{{ $t('message.basicInformation') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="basics-tr">
                                <td>{{ $t('message.companyAddress') }}</td>
                                <td>{{ $t('message.artAuctionAddress') }}</td>
                            </tr>
                            <tr class="basics-tr">
                                <td>{{ $t('message.establishment') }}</td>
                                <td>2005</td>
                            </tr>
                            <tr class="basics-tr">
                                <td>{{ $t('message.transactionRate') }}</td>
                                <td>95%</td>
                            </tr>
                            <tr class="basics-tr">
                                <td>{{ $t('message.totalProceeds') }}</td>
                                <td>{{ $t('message.overYuan') }}</td>
                            </tr>
                            <tr class="basics-tr" style="height: 55px">
                                <td>{{ $t('message.auctionRules') }}</td>
                                <td style="padding: 10px 15px">{{ $t('message.auctionRulesCon') }}</td>
                            </tr>
                        </tbody>
                        <thead>
                            <tr>
                                <th colspan="2" style="font-weight: 500;">{{ $t('message.distributionInfo') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr class="basics-tr">
                                <td>{{ $t('message.sellerShare') }}</td>
                                <td>90%</td>
                            </tr>
                            <tr class="basics-tr">
                                <td>{{ $t('message.serviceFee') }}</td>
                                <td>10%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- 分页 -->
                <div class="page-skip"></div>

                <!-- 拍卖数据详情 -->
                <div id="detection">
                    <h3 style="color: black">{{ $t('message.dataDetails') }}</h3>
                    <div class="detection" v-for="(item,index) in runningReportData.monitorDetails" :key="item.deviceId">
                        <table :key="item.deviceId">
                            <thead>
                                <tr class="detection-tr">
                                    <th colspan="2">{{ index + 1 +". "+item.deviceName }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-for="(e, i) in item.monitors">
                                    <template v-for="(m, n) in e.series">
                                        <tr class="detection-tr">
                                            <td class="tdTit">{{ m.monitorName }}</td>
                                        </tr>
                                        <tr class="detection-tr">
                                            <td class="tdTit">
                                                <div class="itemEcharts" :id="'monit' + index + i + n"></div>
                                            </td>
                                        </tr>
                                    </template>
                                </template>
                                <tr class="detection-tr">
                                    <td class="tdTit">{{ $t('message.statistics') }}</td>
                                </tr>
                                <tr class="detection-tr">
                                    <td>
                                        <div class="itemTxt">
                                            <div class="txtItem">{{ $t('message.statisticalPeriod') }}: {{ item.statistics.period }}</div>
                                            <div class="txtItem">{{ $t('message.classifiedInfo') }}: {{ item.statistics.classInfo }}</div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- 分页 -->
                <div class="page-skip"></div>

                <!-- 销售统计图表 -->
                <div id="historical">
                    <h3 style="color: black">{{ $t('message.statisticsChart') }}</h3>
                    <div class="historical historical-table-div">
                        <table>
                            <thead>
                            <tr>
                                <th colspan="2">{{ $t('message.salesShare') }}</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr class="basics-tr">
                                <td>{{ $t('message.categoryShare') }}</td>
                                <td>{{ $t('message.amountRatio') }}</td>
                            </tr>
                            <tr class="basics-tr">
                                <td>{{ $t('message.statisticalPeriod') }}</td>
                                <td>{{ runningReportData.periodic }}</td>
                            </tr>
                            <tr>
                                <td class="tdTit pieTd">
                                    <div class="itemEcharts descriptions-echarts" id="history1"></div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        <table>
                            <thead>
                            <tr>
                                <th colspan="2">{{ $t('message.yearlyDistributionHistogram') }}</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr class="basics-tr">
                                <td>{{ $t('message.histogram') }}</td>
                                <td>{{ $t('message.salesAmountHistogram') }}</td>
                            </tr>
                            <tr class="basics-tr">
                                <td>{{ $t('message.statisticalPeriod') }}</td>
                                <td>2020~2025</td>
                            </tr>
                            <tr>
                                <td class="tdTit pieTd">
                                    <div class="itemEcharts descriptions-echarts" id="history2"></div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <!-- 工具栏 -->
        <div class="navigation">
            <a-button type="primary" @click="handleOutput" v-loading="handleOutputLoading">{{ $t('message.download') }}</a-button>
        </div>
        <!-- 页眉 -->
        <div class="pdf-header"
             style="position: fixed; top: -100vh;">
            <div class="headerCon">
                <h1 class="headerTitle">
                    {{ $t('message.platformStatistics') }}
                </h1>
                <img class="logoPng" :src="logoPng" style="width: 5.5vw;height: 5vw;"/>
            </div>
            <!-- <div class="pageNum">
              Page : <div class="pdf-footer-page"></div> / <div class="pdf-footer-page-count"></div>
            </div> -->
        </div>
        <!-- 页脚 -->
        <div class="pdf-footer"
             style="font-weight: bold; padding: 15px 8px; width: 100%; border-top: 1px solid rgba(0, 0, 0, 0.85); position: fixed; top: -100vh;">
            <div style="display: flex; justify-content: center; align-items: center; padding-top: 5px;">
                {{ $t('message.name') }}
            </div>
            <div style="display: flex; justify-content: center; align-items: center; margin-top: 20px;">
                <div class="pdf-footer-page"></div> / <div class="pdf-footer-page-count"></div>
            </div>
        </div>
    </div>
</template>

<script>
import logoPng from "@/assets/logo.png"
import { outputPDF } from "../../components/pdf.js"
import { message } from 'ant-design-vue';
import { fullDate } from "../../components/date";
import { useStore } from 'vuex';
import { localizeCategoryLabel } from '@/utils/dictionaryI18n';

export default {
    name: "outputPDF",
    inject: ['echarts'],
    data() {
        return {
            typeList: [],
            loading: true,
            handleOutputLoading: false,
            runningReportData: null,
            logoPng: logoPng,
            // echarts对象
            refsArr: [],
            elseCharts:[],
            // dom对象
            pdfPanel: null,
            pdfCtn: null,
            // 分割后的dom对象数组
            resultChunks:[],
            // 进度数据
            progress: 1,
            // 生成pdf文件名
            pdfFileName: "",
        }
    },
    created() {
        let runningData = require("../../assets/runningReportData.json");
        this.runningReportData = runningData.data;
        this.typeList = [].slice.call(useStore().state.classList);
        this.$nextTick(() => {
            this.drawEcharts();
        });
    },
    updated() {
        this.$nextTick(() => {
            this.drawEcharts();
        });
    },
    methods: {
        localizeCategory(label) {
            return localizeCategoryLabel(label, this.$t);
        },
        drawEcharts() {
            const a4main = document.querySelector('.a4main');
            a4main.querySelector('#a4Report').innerText = this.$store.state.userForm.ADMIN_ID? this.$store.state.userForm.ADMIN_ID: this.$store.state.userForm.USER_ID;
            a4main.querySelector('#companyName').innerText = this.$store.state.userForm.ADMIN_NAME? this.$store.state.userForm.ADMIN_NAME: this.$store.state.userForm.USER_NAME;
            a4main.querySelector('#a4Date').innerText = fullDate(new Date());
            for(let index = 0; index < this.runningReportData.monitorDetails.length; index++) {
                for(let i = 0; i < this.runningReportData.monitorDetails[index].monitors.length; i++) {
                    for(let n = 0; n < this.runningReportData.monitorDetails[index].monitors[i].series.length; n++) {
                        this.refsArr[ 'monit' + index + i + n ] = this.echarts.init(document.querySelector('#monit' + index + i + n));
                        this.refsArr[ 'monit' + index + i + n ].setOption({
                            legend: {
                                // Try 'horizontal'
                                orient: 'vertical',
                                right: 0,
                                // icon: 'path://M 0 50 h 10',
                                data: [ this.runningReportData.monitorDetails[index].monitors[i].series[n].name ]
                            },
                            grid: {
                                x: 80,
                                y: 30,
                                x2: 30,
                                y2: 30
                            },
                            xAxis: {
                                type: 'category',
                                data: this.runningReportData.monitorDetails[index].monitors[i].times
                            },
                            yAxis: {
                                type: 'value'
                            },
                            series: [
                                {
                                    name: this.runningReportData.monitorDetails[index].monitors[i].series[n].name,
                                    data: this.runningReportData.monitorDetails[index].monitors[i].series[n].data,
                                    type: 'line',
                                    showSymbol: 'false',
                                    symbolSize: 0,
                                    lineStyle: {
                                        normal: {
                                            color: 'green'
                                        }
                                    }
                                }
                            ]
                        });
                    }
                }
            }
            // 其他图形
            this.elseCharts[0] = this.echarts.init(document.querySelector('#history1'))
            this.elseCharts[0].setOption({
                animation:false,
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                legend: {
                    left: '0',
                    top: 'center',
                    data: [
                        this.$t('message.sculpture'),
                        this.$t('message.metalCrafts'),
                        this.$t('message.strangeStone'),
                        this.$t('message.paintingCalligraphy'),
                        this.$t('message.ceramics')
                    ]
                },
                series: [
                    {
                        name: 'Area Mode',
                        type: 'pie',
                        radius: [20, 140],
                        center: ['50%', '50%'],
                        roseType: 'area',
                        itemStyle: {
                            borderRadius: 5
                        },
                        data: [
                            { value: 15, name: this.$t('message.sculpture') },
                            { value: 5, name: this.$t('message.metalCrafts') },
                            { value: 22, name: this.$t('message.strangeStone') },
                            { value: 30, name: this.$t('message.paintingCalligraphy') },
                            { value: 28, name: this.$t('message.ceramics') },
                        ]
                    }
                ]
            })
            
            const labelOption = {
                show: true,
                position: 'insideBottom',
                distance: 15,
                align: 'left',
                verticalAlign: 'middle',
                rotate: 90,
                formatter: '{c}  {name|{a}}',
                fontSize: 16,
                rich: {
                    name: {}
                }
            };
            let option = {
                animation:false,
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['Forest', 'Steppe', 'Desert', 'Wetland']
                },
                xAxis: [
                    {
                        type: 'category',
                        axisTick: { show: false },
                        data: ['2018', '2019', '2020', '2021', '2022', '2023']
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name: this.$t('message.paintingCalligraphy'),
                        type: 'bar',
                        barGap: 0,
                        label: labelOption,
                        emphasis: {
                            focus: 'series'
                        },
                        data: [320, 332, 301, 334, 390, 410]
                    },
                    {
                        name: this.$t('message.ceramics'),
                        type: 'bar',
                        label: labelOption,
                        emphasis: {
                            focus: 'series'
                        },
                        data: [220, 182, 191, 234, 290, 320]
                    },
                    {
                        name: this.$t('message.strangeStone'),
                        type: 'bar',
                        label: labelOption,
                        emphasis: {
                            focus: 'series'
                        },
                        data: [150, 232, 201, 154, 190, 230]
                    },
                    {
                        name: this.$t('message.sculpture'),
                        type: 'bar',
                        label: labelOption,
                        emphasis: {
                            focus: 'series'
                        },
                        data: [98, 77, 101, 99, 40, 60]
                    },
                    {
                        name: this.$t('message.metalCrafts'),
                        type: 'bar',
                        label: labelOption,
                        emphasis: {
                            focus: 'series'
                        },
                        data: [34, 56, 78, 59, 30, 40]
                    }
                ]
            };
            this.elseCharts[1] = this.echarts.init(document.querySelector('#history2'))
            this.elseCharts[1].setOption(option);
        },

        // 分割dom的方法
        splitDOMByElement(parentElement, splitElementClassName) {
            // 获取所有子元素
            var children = parentElement.children;

            // 创建一个数组，用于存放分割后的小段
            var chunks = [];
            var currentChunk = document.createElement('div');

            // 迭代子元素
            for (var i = 0; i < children.length; i++) {
                var child = children[i];

                // 复制子元素并添加到当前小段
                var clonedChild = child.cloneNode(true);
                currentChunk.appendChild(clonedChild);

                // 如果当前子元素是分割元素，则将当前小段添加到结果数组中，并重置当前小段
                if (child.classList.contains(splitElementClassName)) {
                    chunks.push(currentChunk);
                    currentChunk = document.createElement('div');
                }

                // 设备信息汇总 超长分段
                // 处理特定id为 "deviceInfos" 的<div>，按class="deviceInfos-table"分割
                if (child.id === 'deviceInfos') {
                    var deviceInfosTable = child.getElementsByClassName('deviceInfos-table');

                    // 查看是否有标题元素
                    var h3Element = currentChunk.querySelector('h3');
                    // 检查是否成功获取了 <h3> 元素
                    if (h3Element) {
                        // 获取 <h3> 元素的父元素
                        var parentDiv = h3Element.parentNode;
                        // 获取父元素中所有具有 class="deviceInfos-table" 的子元素
                        var detectionElements = parentDiv.querySelectorAll('.deviceInfos-table');
                        // 遍历并移除每个具有 class="deviceInfos-table" 的子元素
                        detectionElements.forEach(function(detectionElement) {
                            detectionElement.remove();
                        });
                    }

                    for (var j = 0; j < deviceInfosTable.length; j++) {
                        var deviceInfosTableChild = deviceInfosTable[j];
                        var clonedDeviceInfosTableChild = deviceInfosTableChild.cloneNode(true);
                        currentChunk.appendChild(clonedDeviceInfosTableChild);

                        // 当达到每100个一组时，添加到结果数组中，并重置当前小段
                        if ((j + 1) % 100 === 0) {
                            chunks.push(currentChunk);
                            currentChunk = document.createElement('div');
                        }
                    }
                }

                // 图表详情 超长分段
                // 处理特定id为 "detection" 的<div>，按class="detection"分割
                if (child.id === 'detection') {
                    var detectionChildren = child.getElementsByClassName('detection');

                    // 查看是否有标题元素
                    var h3Element = currentChunk.querySelector('h3');
                    // 检查是否成功获取了 <h3> 元素
                    if (h3Element) {
                        // 获取 <h3> 元素的父元素
                        var parentDiv = h3Element.parentNode;
                        // 获取父元素中所有具有 class="detection" 的子元素
                        var detectionElements = parentDiv.querySelectorAll('.detection');
                        // 遍历并移除每个具有 class="detection" 的子元素
                        detectionElements.forEach(function(detectionElement) {
                            detectionElement.remove();
                        });
                    }

                    for (var j = 0; j < detectionChildren.length; j++) {
                        var detectionChild = detectionChildren[j];
                        var clonedDetectionChild = detectionChild.cloneNode(true);
                        currentChunk.appendChild(clonedDetectionChild);
                        // 当达到每5个一组时，添加到结果数组中，并重置当前小段
                        if ((j + 1) % 5 === 0) {
                            // 添加到结果数组中，并重置当前小段
                            chunks.push(currentChunk);
                            currentChunk = document.createElement('div');
                        }
                    }
                }

                // 历史报警信息 超长分段
                // 处理特定id为 "historical" 的<div>，按class="historical"分割为每5个一组
                if (child.id === 'historical') {
                    var historicalTableDivChildren = child.getElementsByClassName('historical-table-div');

                    // 查看是否有标题元素
                    var h3Element = currentChunk.querySelector('h3');
                    // 检查是否成功获取了 <h3> 元素
                    if (h3Element) {
                        // 获取 <h3> 元素的父元素
                        var parentDiv = h3Element.parentNode;
                        // 获取父元素中所有具有 class="historical-table-div" 的子元素
                        var detectionElements = parentDiv.querySelectorAll('.historical-table-div');
                        // 遍历并移除每个具有 class="historical-table-div" 的子元素
                        detectionElements.forEach(function(detectionElement) {
                            detectionElement.remove();
                        });
                    }

                    for (var j = 0; j < historicalTableDivChildren.length; j++) {
                        var historicalTableDivChild = historicalTableDivChildren[j];
                        var clonedHistoricalTableDivChild = historicalTableDivChild.cloneNode(true);
                        currentChunk.appendChild(clonedHistoricalTableDivChild);

                        // 当达到每60个一组时，添加到结果数组中，并重置当前小段
                        if ((j + 1) % 60 === 0) {
                            chunks.push(currentChunk);
                            currentChunk = document.createElement('div');
                        }
                    }
                }

            }

            // 将最后一个小段添加到结果数组中
            if (currentChunk.children.length > 0) {
                chunks.push(currentChunk);
            }

            return chunks;
        },

        // 打印下载
        async handleOutput() {
            // 下载提示
            this.handleOutputLoading = true;
            message.warning(this.$t('message.downloading') + this.progress + "%",0);
            // this.option = this.$message({
            //     message: "正在下载中，请勿重复点击，" + "生成进度："+ this.progress + "%",
            //     type: "warning",
            //     duration:0,
            // });
            const element = document.querySelector('.pdf-panel');

            this.pdfPanel = element;
            this.pdfCtn = element.parentNode;

            const header = document.querySelector('.pdf-header');
            const footer = document.querySelector('.pdf-footer');
            try {
                // 例子的使用方式
                var splitElementClassName = 'page-skip';

                this.resultChunks = this.splitDOMByElement(element, splitElementClassName);

                // 重新添加dom前销毁echarts元素
                for (const i in this.refsArr) {
                    this.refsArr[i].dispose();
                }
                for (const i in this.elseCharts) {
                    this.elseCharts[i].dispose();
                }

                // 获取父元素
                const parentElement = element.parentNode;

                // 将小段添加到DOM中，这里只是演示，实际使用时可以根据需要进行其他处理
                this.resultChunks.forEach(function(chunk) {
                    // document.body.appendChild(chunk);
                    parentElement.appendChild(chunk);
                });

                // 检查元素是否存在
                if (element) {
                    // 从父元素中移除指定的子元素
                    parentElement.removeChild(element);
                }

                this.drawEcharts();

                // 开启前端多线程 Worker
                // 创建一个web worker
                const worker = new Worker(URL.createObjectURL(new Blob([`
					onmessage = function(e) {
						postMessage('Worker: Message received from main script');
						var data = e.data;
						switch (data.cmd) {
						case 'start':
							// 在这里执行你的操作
							break;
						default:
							postMessage('Unknown command');
						};
					}
				`], { type: 'text/javascript' })));

                // 启动worker
                worker.postMessage({ cmd: 'start' });

                // jsPDF对象
                let jsPDFObject = null;

                var allPages = [];

                for (const [index, item] of this.resultChunks.entries()) {
                    // 判断是不是最后一个
                    const isFinally = Boolean(this.resultChunks.length - 1 === index);

                    let outputPDFData = await outputPDF({
                        element: this.resultChunks[index],
                        footer: footer,
                        header: header,
                        contentWidth: 560,
                        filename:this.pdfFileName,
                        jsPDFObject,
                        isFinally,
                        allPages
                    });

                    // 修改进度
                    this.progress = (index + 1) / this.resultChunks.length * 100;
                    this.option ? this.option.close():'';
                    message.warning(this.$t('message.downloading') + this.progress + "%",0);

                    jsPDFObject = outputPDFData.pdf;
                    allPages = outputPDFData.allPages;
                }

                // 关闭多线程
                worker.postMessage({ cmd: 'stop' });

                // 将dom元素恢复原样
                // 清空 <div class="pdf-ctn"> 中的所有元素
                this.pdfCtn.innerHTML = '';
                // 将 <div class="pdf-panel"> 添加到 <div class="pdf-ctn"> 中
                this.pdfCtn.appendChild(this.pdfPanel);
                this.resultChunks = [];
                this.pdfPanel = null;
                this.pdfCtn = null;
                this.progress = 1;
                this.pdfFileName = "";

                // 成功的消息提示
                this.option ? this.option.close():'';
                message.success(this.$t('message.downloadSuc') );
                setTimeout(() => {
                    message.destroy();
                }, 1000);
                this.handleOutputLoading = false;
            } catch (error) {
                this.resultChunks = [];
                this.progress = 1;
                this.pdfFileName = "";
                this.option ? this.option.close():'';
                this.handleOutputLoading = false;
                console.log(error,"error")
                // message.error(typeof error === 'string' ? error : JSON.stringify(error))
            }
        }
    }

};
</script>

<style scoped>
@import url("./Statistics.css");
</style>
