import { getDb } from '@/lib/mongodb';
import { Activity, Users, Monitor, Cpu, HardDrive, BarChart3, PieChart, Info } from 'lucide-react';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function TelemetryDashboard() {
    let allDevices: any[] = [];
    try {
        const db = await getDb();
        allDevices = await db.collection('telemetry').find({}).toArray();
    } catch (err) {
        console.warn('MongoDB not configured yet. Skipping telemetry fetch during build.');
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl flex flex-col items-center max-w-md text-center">
                    <Activity className="w-12 h-12 text-rose-500 mb-4 opacity-50" />
                    <h2 className="text-xl font-semibold mb-2">MongoDB Missing</h2>
                    <p className="text-white/60">
                        Please check your MongoDB connection in .env.local
                    </p>
                </div>
            </div>
        );
    }
    
    if (allDevices.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
                <div className="bg-white/5 border border-white/10 p-8 rounded-2xl flex flex-col items-center max-w-md text-center">
                    <Activity className="w-12 h-12 text-blue-500 mb-4 opacity-50" />
                    <h2 className="text-xl font-semibold mb-2">Awaiting Telemetry</h2>
                    <p className="text-white/60">
                        No telemetry data has been received yet. Metrics will appear here automatically once clients start pinging the API.
                    </p>
                </div>
            </div>
        );
    }

    const data: Record<string, Record<string, number>> = {
        app_version: {},
        os_version: {},
        os_name: {},
        cpu_brand: {},
        ram: {},
    };
    
    const totalDevices = allDevices.length;

    allDevices.forEach((device) => {
        const inc = (category: string, value: string) => {
            if (!value || value === 'Unknown') return;
            if (!data[category]) data[category] = {};
            data[category][value] = (data[category][value] || 0) + 1;
        };

        inc('app_version', device.app_version);
        inc('os_version', device.os_version);
        inc('os_name', device.os_name);
        inc('cpu_brand', device.cpu_brand);
        inc('ram', device.ram_bucket);
    });

    const sortMetrics = (metrics: Record<string, number>) => {
        return Object.entries(metrics).sort((a, b) => b[1] - a[1]);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-32 pb-16 px-8 md:px-12 font-sans selection:bg-blue-500/30">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <Activity className="w-6 h-6 text-blue-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        ColorWall Telemetry
                    </h1>
                </div>
                <p className="text-white/50 text-sm md:text-base flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Live, anonymous hardware and usage metrics. Deduplicated by device. Updated every 60 seconds.
                </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Total Devices Card */}
                <div className="lg:col-span-3 bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div>
                        <h2 className="text-white/60 font-medium mb-1 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Total Unique Devices
                        </h2>
                        <div className="text-5xl md:text-7xl font-bold tracking-tighter">
                            {totalDevices.toLocaleString()}
                        </div>
                    </div>
                    <div className="hidden md:flex gap-4">
                        <div className="flex flex-col gap-1 items-end">
                            <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">Active Versions</span>
                            <span className="text-xl font-semibold">{Object.keys(data.app_version).length}</span>
                        </div>
                        <div className="w-px bg-white/10" />
                        <div className="flex flex-col gap-1 items-start">
                            <span className="text-xs text-white/40 uppercase tracking-wider font-semibold">CPU Architectures</span>
                            <span className="text-xl font-semibold">{Object.keys(data.cpu_brand).length}</span>
                        </div>
                    </div>
                </div>

                {/* App Versions */}
                <MetricCard 
                    title="App Versions" 
                    icon={<Monitor className="w-5 h-5 text-indigo-400" />}
                    metrics={sortMetrics(data.app_version)} 
                    total={totalDevices}
                />

                {/* OS Distribution */}
                <MetricCard 
                    title="Operating Systems" 
                    icon={<PieChart className="w-5 h-5 text-emerald-400" />}
                    metrics={sortMetrics(data.os_name)} 
                    total={totalDevices}
                />

                {/* RAM Distribution */}
                <MetricCard 
                    title="System RAM" 
                    icon={<HardDrive className="w-5 h-5 text-amber-400" />}
                    metrics={sortMetrics(data.ram)} 
                    total={totalDevices}
                />

                {/* CPU Brands */}
                <div className="lg:col-span-3">
                    <MetricCard 
                        title="CPU Processors" 
                        icon={<Cpu className="w-5 h-5 text-rose-400" />}
                        metrics={sortMetrics(data.cpu_brand)} 
                        total={totalDevices}
                        grid={true}
                    />
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, icon, metrics, total, grid = false }: { title: string, icon: React.ReactNode, metrics: [string, number][], total: number, grid?: boolean }) {
    if (metrics.length === 0) return null;
    
    // Safety check for total to prevent division by zero
    const displayTotal = total > 0 ? total : Math.max(...metrics.map(m => m[1]), 1);

    return (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                {icon}
                <h3 className="text-lg font-medium tracking-tight text-white/90">{title}</h3>
            </div>
            
            <div className={`gap-4 ${grid ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'flex flex-col'}`}>
                {metrics.map(([name, count]) => {
                    const percentage = (count / displayTotal) * 100;
                    return (
                        <div key={name} className="flex flex-col gap-2">
                            <div className="flex justify-between items-end text-sm">
                                <span className="text-white/80 font-medium truncate max-w-[70%]" title={name}>{name}</span>
                                <span className="text-white/40 tabular-nums">{count.toLocaleString()} <span className="text-white/20 ml-1">({percentage.toFixed(1)}%)</span></span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-white/20 to-white/40 rounded-full"
                                    style={{ width: `${Math.max(percentage, 1)}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
