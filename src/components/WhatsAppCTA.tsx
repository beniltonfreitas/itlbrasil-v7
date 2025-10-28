import { MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const WhatsAppCTA = () => {
  return (
    <Card className="my-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-2 border-green-300 dark:border-green-700 hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <MessageCircle className="h-8 w-8 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-green-900 dark:text-green-100 mb-1 text-lg">
              {">> Siga o canal da ITL Brasil no WhatsApp"}
            </p>
            <a 
              href="https://whatsapp.com/channel/0029Vb735uVIt5rscmQ3XA0Z"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 hover:underline transition-colors text-sm break-all"
            >
              https://whatsapp.com/channel/0029Vb735uVIt5rscmQ3XA0Z
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
