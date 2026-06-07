import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Download, Upload, RotateCcw, Database, Shield, Settings as SettingsIcon, AlertTriangle } from 'lucide-react';

export function SettingsPage() {
  const { settings, updateSettings, exportData, importData, resetData } = useStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cinetrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (confirm('导入数据将覆盖当前所有数据，确定要继续吗？')) {
          importData(content);
          alert('数据导入成功！');
        }
      } catch (err) {
        alert('导入失败，请确保文件格式正确');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('确定要重置所有数据吗？此操作不可撤销！')) {
      resetData();
      setShowResetConfirm(false);
      alert('数据已重置为初始状态');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
          设置
        </h1>
        <p className="text-sm text-film-400 mt-1">
          管理你的数据和偏好设置
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="p-5 bg-[#15151c] rounded-xl border border-[#252530]">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-400" />
            数据管理
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#1a1a24] rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">导出数据</p>
                <p className="text-xs text-film-400 mt-0.5">将所有数据导出为 JSON 文件备份</p>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                导出
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#1a1a24] rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">导入数据</p>
                <p className="text-xs text-film-400 mt-0.5">从 JSON 备份文件恢复数据</p>
              </div>
              <label className="flex items-center gap-2 px-4 py-2 bg-[#252530] text-white rounded-lg hover:bg-[#2f2f3d] transition-colors text-sm cursor-pointer">
                <Upload className="w-4 h-4" />
                导入
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#1a1a24] rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">重置数据</p>
                <p className="text-xs text-film-400 mt-0.5">恢复到初始状态，清除所有数据</p>
              </div>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                重置
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 bg-[#15151c] rounded-xl border border-[#252530]">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-amber-400" />
            偏好设置
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#1a1a24] rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">默认年份</p>
                <p className="text-xs text-film-400 mt-0.5">新添加影片的默认年份</p>
              </div>
              <input
                type="number"
                value={settings.defaultYear}
                onChange={(e) => updateSettings({ defaultYear: parseInt(e.target.value) })}
                className="w-24 px-3 py-2 bg-[#252530] border border-[#353540] rounded-lg text-white text-sm text-center"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#1a1a24] rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">默认隐私</p>
                <p className="text-xs text-film-400 mt-0.5">新建榜单的默认隐私设置</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateSettings({ privacy: 'private' })}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    settings.privacy === 'private'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-[#252530] text-film-400'
                  }`}
                >
                  私密
                </button>
                <button
                  onClick={() => updateSettings({ privacy: 'public' })}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    settings.privacy === 'public'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-[#252530] text-film-400'
                  }`}
                >
                  公开
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-[#15151c] rounded-xl border border-[#252530]">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            关于
          </h3>
          <div className="space-y-2 text-sm text-film-300">
            <p><span className="text-film-500">应用名称：</span>CineTrack 影视追踪看板</p>
            <p><span className="text-film-500">版本：</span>v1.0.0</p>
            <p><span className="text-film-500">数据存储：</span>本地浏览器存储，数据不会上传</p>
            <p className="text-film-500 pt-2">
              专为影评博主打造的年度观影内容整理工具，所有数据均保存在本地浏览器中，请定期备份。
            </p>
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative w-full max-w-md bg-[#15151c] rounded-2xl border border-[#252530] p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">确认重置</h3>
            </div>
            <p className="text-sm text-film-300 mb-6">
              此操作将清除所有数据，包括影片、榜单、台词等所有内容，并恢复为初始演示数据。
              此操作不可撤销，建议先导出备份。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 bg-[#252530] text-white rounded-lg hover:bg-[#2f2f3d] transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
