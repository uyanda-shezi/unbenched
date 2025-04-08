import  mongoose, { Schema } from  "mongoose";
import { IGame } from "./Game";


export interface IUser extends Document{
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password:string;
    role: string;
    image?: string;
    gamesOrganized: mongoose.Types.ObjectId[] | IGame[];
    gamesJoined: mongoose.Types.ObjectId[] | IGame[];
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"]
          },
        email: {
            type: String,
            unique: true,
            required: [true, "Email is required"],
            match: [
              /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
              "Email is invalid",
            ],
          },
        password: {type:String, required: true},
        role: {type:String, default: 'user'},
        image: { type: String},
        gamesOrganized: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
        gamesJoined: [{ type: Schema.Types.ObjectId, ref: 'Game' }],
        skillLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'beginner'
        },
    },
    { timestamps: true }
);

const User = mongoose.models?.User || mongoose.model<IUser>('User', UserSchema);
export default User;