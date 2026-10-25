import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';

// Tells Chart.js which pieces we use. Import this file once before drawing charts.
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export const CHART_COLORS = [
  '#1b5e20',
  '#43a047',
  '#81c784',
  '#f9a825',
  '#ef6c00',
  '#5c6bc0',
  '#8d6e63',
];