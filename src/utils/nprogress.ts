/**
 * nprogress 配置
 */
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// 配置 nprogress
NProgress.configure({
  showSpinner: false, // 不显示加载spinner
  trickleSpeed: 200, // 自动递增间隔
  minimum: 0.3, // 最小百分比
  easing: 'ease', // 动画方式
  speed: 500, // 递增进度条的速度
});

export default NProgress;
