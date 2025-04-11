import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User'; // Adjust import path
import { NotificationType } from '@/enums/NotificationType';

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId | IUser; // The organizer who receives the notification
    sender: mongoose.Types.ObjectId | IUser | null; // The user who made the request (can be null for system notifications)
    game: mongoose.Types.ObjectId; // The game the notification is related to
    type: NotificationType;
    message: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        sender: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        game: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
        type: { type: String, enum: Object.values(NotificationType), required: true },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Notification = mongoose.models.Notification as mongoose.Model<INotification> || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;