import React, { useEffect, useRef, useState } from "react";
import simpleheat from "simpleheat";
import BLOCK_ANCHORS from "./data/blocks";
import { adminAPI } from "../../services/api";
import { Card } from "../ui/Card";
import { Loader2 } from "lucide-react";
import "./styles.css";

const IMAGE_WIDTH = 1000;
const IMAGE_HEIGHT = 600;

function CampusHeatmapDemo() {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('total');
  const [heatmapData, setHeatmapData] = useState([]);
  const [hoveredBlock, setHoveredBlock] = useState(null);

  useEffect(() => {
    const fetchHeatmap = async () => {
      setLoading(true);
      try {
        const response = await adminAPI.getHeatmap(filter);
        setHeatmapData(response.data);
      } catch (err) {
        console.error("Failed to fetch heatmap data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmap();
  }, [filter]);

  useEffect(() => {
    if (!canvasRef.current || loading) return;

    const heat = simpleheat(canvasRef.current);
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);

    // Map database aggregations to visual pixel anchors
    let maxDensity = 1;
    const points = heatmapData.map((stat) => {
      const anchor = BLOCK_ANCHORS.find((b) => b.name === stat.location);
      if (anchor) {
        // Multiplier helps visibility for small datasets
        const weight = stat.count * (filter === 'high' ? 2 : 1);
        if (weight > maxDensity) maxDensity = weight;
        return [anchor.x, anchor.y, weight];
      }
      return null;
    }).filter(Boolean);

    if (points.length > 0) {
      heat.data(points);
      heat.radius(40, 25);
      heat.max(maxDensity);
      heat.draw();
    }
  }, [heatmapData, loading, filter]);

  return (
    <Card className="w-full shadow-lg border-0 bg-white overflow-hidden p-6 animate-fade-in relative">

      {/* Dynamic Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            📍 Campus Heatmap Overview
            {loading && <Loader2 className="animate-spin text-primary-500 w-5 h-5" />}
          </h2>
          <p className="text-slate-500 text-sm">Real-time issue density across the institution.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
          {['total', 'pending', 'high'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${filter === type
                ? 'bg-white shadow-sm border border-slate-200 text-primary-700'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Canvas Wrapper */}
      <div className="relative w-full overflow-x-auto pb-4 rounded-xl">
        <div className="w-[1000px] min-w-[1000px] max-w-[1000px] h-[600px] relative rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50 mx-auto">
          <img
            src="/campus.png"
            alt="Campus Map"
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            className="absolute top-0 left-0 w-full h-full object-cover opacity-80"
            draggable={false}
          />
          <canvas
            ref={canvasRef}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            className="absolute top-0 left-0 w-full h-full z-10 transition-opacity duration-500"
            style={{ opacity: loading ? 0.3 : 0.8 }}
          />

          {/* Interactive Block Labels */}
          {!loading && BLOCK_ANCHORS.map((b) => {
            const stat = heatmapData.find(s => s.location === b.name);
            const count = stat ? stat.count : 0;
            const isHovered = hoveredBlock === b.name;

            return (
              <div
                key={b.name}
                className={`absolute z-20 flex flex-col items-center justify-center transition-all cursor-pointer group`}
                style={{ left: b.x - 40, top: b.y - 20, width: 80 }}
                onMouseEnter={() => setHoveredBlock(b.name)}
                onMouseLeave={() => setHoveredBlock(null)}
              >
                <div className={`px-2 py-1 rounded bg-white/90 backdrop-blur shadow-sm border text-xs font-bold whitespace-nowrap transition-all
                  ${count > 0 ? 'border-primary-300 text-primary-900 group-hover:-translate-y-1' : 'border-slate-200 text-slate-500 opacity-60'}`}>
                  {b.name}
                </div>
                {count > 0 && (
                  <div className={`absolute -top-3 -right-2 w-6 h-6 flex items-center justify-center rounded-full text-white text-[10px] font-bold shadow bg-red-500 animate-in fade-in zoom-in group-hover:-translate-y-1 transition-all`}>
                    {count}
                  </div>
                )}
                {isHovered && count > 0 && (
                  <div className="absolute top-8 w-max px-3 py-2 bg-slate-900 text-white rounded-lg shadow-xl text-xs flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
                    <span className="font-bold opacity-80">{b.name}</span>
                    <span className="text-primary-300 font-black">{count} {filter === 'total' ? 'Reports' : filter.toUpperCase() + ' Issues'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export default CampusHeatmapDemo;
