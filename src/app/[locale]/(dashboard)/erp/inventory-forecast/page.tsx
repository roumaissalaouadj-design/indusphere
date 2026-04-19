'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { TrendingUp, Package, AlertTriangle, ArrowRight } from 'lucide-react';
import styles from '@/styles/pages/inventory-forecast.module.css';

interface ForecastItem {
  _id: string;
  itemCode: string;
  name: string;
  currentQuantity: number;
  minStock: number;
  avgMonthlyConsumption: number;
  forecastedQuantity: number;
  shortageDate: string;
  riskLevel: 'high' | 'medium' | 'low';
  recommendation: string;
  unit: string;
}

export default function InventoryForecastPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Common');
  
  // ✅ نصوص ثابتة حسب اللغة
  const getTitle = () => {
    if (locale === 'ar') return 'توقع المخزون';
    if (locale === 'fr') return 'Prévision des stocks';
    return 'Inventory Forecast';
  };

  const getDescription = () => {
    if (locale === 'ar') return 'تحليل وتوقع احتياجات المخزون بناءً على معدلات الاستهلاك';
    if (locale === 'fr') return 'Analyser et prévoir les besoins en stock en fonction des taux de consommation';
    return 'Analyze and forecast inventory needs based on consumption rates';
  };

  const getTotalItemsLabel = () => {
    if (locale === 'ar') return 'إجمالي العناصر';
    if (locale === 'fr') return 'Total des articles';
    return 'Total Items';
  };

  const getHighRiskLabel = () => {
    if (locale === 'ar') return 'خطر مرتفع';
    if (locale === 'fr') return 'Risque élevé';
    return 'High Risk';
  };

  const getMediumRiskLabel = () => {
    if (locale === 'ar') return 'خطر متوسط';
    if (locale === 'fr') return 'Risque moyen';
    return 'Medium Risk';
  };

  const getLowRiskLabel = () => {
    if (locale === 'ar') return 'خطر منخفض';
    if (locale === 'fr') return 'Risque faible';
    return 'Low Risk';
  };

  const getItemCodeLabel = () => {
    if (locale === 'ar') return 'رمز العنصر';
    if (locale === 'fr') return 'Code article';
    return 'Item Code';
  };

  const getNameLabel = () => {
    if (locale === 'ar') return 'الاسم';
    if (locale === 'fr') return 'Nom';
    return 'Name';
  };

  const getCurrentQuantityLabel = () => {
    if (locale === 'ar') return 'الكمية الحالية';
    if (locale === 'fr') return 'Quantité actuelle';
    return 'Current Quantity';
  };

  const getMonthlyConsumptionLabel = () => {
    if (locale === 'ar') return 'الاستهلاك الشهري';
    if (locale === 'fr') return 'Consommation mensuelle';
    return 'Monthly Consumption';
  };

  const getForecastedQuantityLabel = () => {
    if (locale === 'ar') return 'الكمية المتوقعة';
    if (locale === 'fr') return 'Quantité prévue';
    return 'Forecasted Quantity';
  };

  const getShortageDateLabel = () => {
    if (locale === 'ar') return 'تاريخ النقص';
    if (locale === 'fr') return 'Date de pénurie';
    return 'Shortage Date';
  };

  const getRiskLevelLabel = () => {
    if (locale === 'ar') return 'مستوى الخطر';
    if (locale === 'fr') return 'Niveau de risque';
    return 'Risk Level';
  };

  const getRecommendationLabel = () => {
    if (locale === 'ar') return 'التوصية';
    if (locale === 'fr') return 'Recommandation';
    return 'Recommendation';
  };

  const getInfoTitle = () => {
    if (locale === 'ar') return 'حول توقع المخزون';
    if (locale === 'fr') return 'À propos de la prévision des stocks';
    return 'About Inventory Forecast';
  };

  const getInfoText = () => {
    if (locale === 'ar') return 'يتم حساب التوقعات بناءً على متوسط الاستهلاك الشهري لكل عنصر خلال آخر 6 أشهر، مع مراعاة الحد الأدنى للمخزون. يُنصح بإعادة الطلب عند وصول المخزون إلى مستوى الخطر.';
    if (locale === 'fr') return 'Les prévisions sont calculées sur la base de la consommation mensuelle moyenne de chaque article au cours des 6 derniers mois, en tenant compte du stock minimum. Il est recommandé de passer commande lorsque le stock atteint un niveau critique.';
    return 'Forecasts are calculated based on the average monthly consumption of each item over the last 6 months, taking into account the minimum stock level. It is recommended to reorder when stock reaches a critical level.';
  };

  const [forecasts, setForecasts] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    try {
      const res = await fetch('/api/inventory/forecast');
      const data = await res.json();
      if (data.success) {
        setForecasts(data.data);
      } else {
        setError(data.message);
      }
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const getRiskClass = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'high': return styles.riskHigh;
      case 'medium': return styles.riskMedium;
      case 'low': return styles.riskLow;
      default: return '';
    }
  };

  const getRiskLabel = (riskLevel: string): string => {
    if (locale === 'ar') {
      switch (riskLevel) {
        case 'high': return 'خطر مرتفع';
        case 'medium': return 'خطر متوسط';
        case 'low': return 'خطر منخفض';
        default: return riskLevel;
      }
    }
    if (locale === 'fr') {
      switch (riskLevel) {
        case 'high': return 'Risque élevé';
        case 'medium': return 'Risque moyen';
        case 'low': return 'Risque faible';
        default: return riskLevel;
      }
    }
    switch (riskLevel) {
      case 'high': return 'High Risk';
      case 'medium': return 'Medium Risk';
      case 'low': return 'Low Risk';
      default: return riskLevel;
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-FR' : 'en-US');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <TrendingUp className={styles.titleIcon} />
              {getTitle()}
            </h1>
            <p className={styles.subtitle}>
              {getDescription()}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {/* Summary Stats */}
        {!loading && forecasts.length > 0 && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{getTotalItemsLabel()}</div>
              <div className={styles.statValue}>{forecasts.length}</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{getHighRiskLabel()}</div>
              <div className={`${styles.statValue} ${styles.statValueRed}`}>
                {forecasts.filter(f => f.riskLevel === 'high').length}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{getMediumRiskLabel()}</div>
              <div className={`${styles.statValue} ${styles.statValueOrange}`}>
                {forecasts.filter(f => f.riskLevel === 'medium').length}
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>{getLowRiskLabel()}</div>
              <div className={`${styles.statValue} ${styles.statValueGreen}`}>
                {forecasts.filter(f => f.riskLevel === 'low').length}
              </div>
            </div>
          </div>
        )}

        {/* Forecast Table */}
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.tableHeaderCell}>{getItemCodeLabel()}</th>
                <th className={styles.tableHeaderCell}>{getNameLabel()}</th>
                <th className={styles.tableHeaderCell}>{getCurrentQuantityLabel()}</th>
                <th className={styles.tableHeaderCell}>{getMonthlyConsumptionLabel()}</th>
                <th className={styles.tableHeaderCell}>{getForecastedQuantityLabel()}</th>
                <th className={styles.tableHeaderCell}>{getShortageDateLabel()}</th>
                <th className={styles.tableHeaderCell}>{getRiskLevelLabel()}</th>
                <th className={styles.tableHeaderCell}>{getRecommendationLabel()}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className={styles.loadingState}>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1ABC9C] mx-auto"></div>
                    <p className="mt-2">{t('loading')}</p>
                  </td>
                </tr>
              ) : forecasts.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.emptyState}>
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    {t('noData')}
                  </td>
                </tr>
              ) : (
                forecasts.map((item) => (
                  <tr key={item._id} className={styles.tableRow}>
                    <td className={`${styles.tableCell} ${styles.cellCode}`}>{item.itemCode}</td>
                    <td className={`${styles.tableCell} ${styles.cellName}`}>{item.name}</td>
                    <td className={styles.tableCell}>{item.currentQuantity} {item.unit}</td>
                    <td className={styles.tableCell}>{item.avgMonthlyConsumption}</td>
                    <td className={`${styles.tableCell} ${item.forecastedQuantity <= item.minStock ? styles.quantityLow : ''}`}>
                      {item.forecastedQuantity}
                    </td>
                    <td className={styles.tableCell}>
                      {formatDate(item.shortageDate)}
                    </td>
                    <td className={styles.tableCell}>
                      <span className={`${styles.riskBadge} ${getRiskClass(item.riskLevel)}`}>
                        {getRiskLabel(item.riskLevel)}
                      </span>
                    </td>
                    <td className={styles.tableCell}>
                      <span className={styles.recommendation}>
                        {item.recommendation}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Info Box */}
        <div className={styles.infoBox}>
          <div className={styles.infoIcon}>ℹ️</div>
          <div className={styles.infoContent}>
            <h4 className={styles.infoTitle}>{getInfoTitle()}</h4>
            <p className={styles.infoText}>{getInfoText()}</p>
          </div>
        </div>

      </div>
    </div>
  );
}