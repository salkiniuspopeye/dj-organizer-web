import { SwipeFeed } from "./features/swipe/SwipeFeed";
import { useTranslation } from 'react-i18next';

export default function App() {
  const { t } = useTranslation();
  return (
    <div className="p-4 rounded-xl bg-indigo-600 text-white">
      {t("app_title")}
      <SwipeFeed />
    </div>
  );
}
