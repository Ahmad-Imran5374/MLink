import { Check, CheckCheck } from "lucide-react";

function MessageStatus({ message, isOwnMessage, textColor }) {
  if (!isOwnMessage) return null;

  return (
    <div className="flex items-center">
      {message.seen ? (
        <CheckCheck
          size={18}
          className={`${textColor || "text-current"} opacity-100`}
          title="Seen"
        />
      ) : (
        <Check
          size={18}
          className={`${textColor || "text-current"} opacity-50`}
          title="Delivered"
        />
      )}
    </div>
  );
}

export default MessageStatus;
