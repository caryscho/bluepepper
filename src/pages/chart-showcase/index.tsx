import { useEffect, useRef } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
} from "chart.js";
import shippingData from "../../data/shipping-sample.json";
import type { ShippingData } from "../../types/shipping";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Title,
    Tooltip,
    Legend
);

export default function ChartShowcasePage() {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartId = "shipping-impact-chart";

    const data = shippingData as ShippingData;

    useEffect(() => {
        if (!chartRef.current) return;

        // Get canvas context
        const ctx = chartRef.current.getContext("2d");
        if (!ctx) return;

        // Check if chart already exists and destroy it
        const existingChart = ChartJS.getChart(chartId);
        if (existingChart) {
            existingChart.destroy();
        }

        // Prepare data
        const labels = data.impactData.map((item) => {
            const date = new Date(item.timestamp);
            return date.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
            });
        });

        const normalData = data.impactData.map((item) =>
            item.severity === "normal" ? item.gForce : null
        );

        const warningData = data.impactData.map((item) =>
            item.severity === "warning" ? item.gForce : null
        );

        const dangerData = data.impactData.map((item) =>
            item.severity === "danger" ? item.gForce : null
        );

        const options: ChartOptions<"line"> = {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: "index",
                intersect: false,
            },
            plugins: {
                legend: {
                    position: "top",
                },
                title: {
                    display: true,
                    text: `운송 충격 모니터링 - ${data.origin} → ${data.destination}`,
                    font: {
                        size: 18,
                    },
                },
                tooltip: {
                    callbacks: {
                        afterLabel: (context) => {
                            const index = context.dataIndex;
                            const event = data.impactData[index].event;
                            return event ? `이벤트: ${event}` : "";
                        },
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "G-Force (중력가속도)",
                    },
                    ticks: {
                        callback: (value) => `${value}G`,
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: "시간",
                    },
                },
            },
        };

        // Create chart with explicit ID
        new ChartJS(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [
                    {
                        label: "정상",
                        data: normalData,
                        borderColor: "rgb(34, 197, 94)",
                        backgroundColor: "rgba(34, 197, 94, 0.5)",
                        pointRadius: 6,
                        pointHoverRadius: 8,
                    },
                    {
                        label: "경고",
                        data: warningData,
                        borderColor: "rgb(234, 179, 8)",
                        backgroundColor: "rgba(234, 179, 8, 0.5)",
                        pointRadius: 8,
                        pointHoverRadius: 10,
                    },
                    {
                        label: "위험",
                        data: dangerData,
                        borderColor: "rgb(239, 68, 68)",
                        backgroundColor: "rgba(239, 68, 68, 0.8)",
                        pointRadius: 10,
                        pointHoverRadius: 12,
                        pointStyle: "star",
                    },
                ],
            },
            options,
        });

        return () => {
            const chart = ChartJS.getChart(chartId);
            if (chart) {
                chart.destroy();
            }
        };
    }, [data]);

    const dangerEvents = data.impactData.filter(
        (item) => item.severity === "danger"
    );
    const warningEvents = data.impactData.filter(
        (item) => item.severity === "warning"
    );

    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <div className="mx-auto space-y-6 max-w-7xl">
                {/* Header */}
                <div className="p-6 bg-white rounded-lg shadow">
                    <h1 className="mb-4 text-3xl font-bold text-gray-900">
                        운송 충격 모니터링 대시보드
                    </h1>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm font-medium text-blue-600">
                                운송 ID
                            </p>
                            <p className="text-lg font-bold text-blue-900">
                                {data.shipmentId}
                            </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm font-medium text-green-600">
                                정상
                            </p>
                            <p className="text-lg font-bold text-green-900">
                                {data.summary.normalCount}회
                            </p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <p className="text-sm font-medium text-yellow-600">
                                경고
                            </p>
                            <p className="text-lg font-bold text-yellow-900">
                                {data.summary.warningCount}회
                            </p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg">
                            <p className="text-sm font-medium text-red-600">
                                위험
                            </p>
                            <p className="text-lg font-bold text-red-900">
                                {data.summary.dangerCount}회
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="p-6 bg-white rounded-lg shadow">
                    <div className="h-[500px]">
                        <canvas id="shipping-impact-chart" ref={chartRef}></canvas>
                    </div>
                </div>

                {/* Events Table */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Danger Events */}
                    <div className="p-6 bg-white rounded-lg shadow">
                        <h2 className="mb-4 text-xl font-bold text-red-600">
                            🚨 위험 이벤트 ({dangerEvents.length})
                        </h2>
                        <div className="space-y-3">
                            {dangerEvents.map((event, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 bg-red-50 rounded border-l-4 border-red-500"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-red-900">
                                                {event.event}
                                            </p>
                                            <p className="text-sm text-red-700">
                                                {new Date(
                                                    event.timestamp
                                                ).toLocaleString("ko-KR")}
                                            </p>
                                        </div>
                                        <span className="text-2xl font-bold text-red-600">
                                            {event.gForce.toFixed(1)}G
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Warning Events */}
                    <div className="p-6 bg-white rounded-lg shadow">
                        <h2 className="mb-4 text-xl font-bold text-yellow-600">
                            ⚠️ 경고 이벤트 ({warningEvents.length})
                        </h2>
                        <div className="space-y-3">
                            {warningEvents.map((event, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 bg-yellow-50 rounded border-l-4 border-yellow-500"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-yellow-900">
                                                {event.event}
                                            </p>
                                            <p className="text-sm text-yellow-700">
                                                {new Date(
                                                    event.timestamp
                                                ).toLocaleString("ko-KR")}
                                            </p>
                                        </div>
                                        <span className="text-2xl font-bold text-yellow-600">
                                            {event.gForce.toFixed(1)}G
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">
                        운송 요약
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="pl-4 border-l-4 border-blue-500">
                            <p className="text-sm text-gray-600">
                                총 운송 시간
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                                {(data.summary.totalDuration / 3600).toFixed(1)}
                                시간
                            </p>
                        </div>
                        <div className="pl-4 border-l-4 border-purple-500">
                            <p className="text-sm text-gray-600">최대 충격</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data.summary.maxImpact.toFixed(1)}G
                            </p>
                        </div>
                        <div className="pl-4 border-l-4 border-indigo-500">
                            <p className="text-sm text-gray-600">평균 충격</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {data.summary.avgImpact.toFixed(1)}G
                            </p>
                        </div>
                    </div>
                    <div className="pt-4 mt-4 border-t">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">출발지</span>
                            <span className="font-medium">{data.origin}</span>
                        </div>
                        <div className="flex justify-between mt-2 text-sm">
                            <span className="text-gray-600">도착지</span>
                            <span className="font-medium">
                                {data.destination}
                            </span>
                        </div>
                        <div className="flex justify-between mt-2 text-sm">
                            <span className="text-gray-600">차량</span>
                            <span className="font-medium">{data.vehicle}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
