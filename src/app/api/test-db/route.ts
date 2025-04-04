import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Game from '@/models/Game';

export async function GET(request: Request) {
    try {
        const connection = await connectToDatabase();
        return NextResponse.json({ 
          message: 'Database connection successful', 
          mongoVersion: connection.connection.version 
        });
      } catch (error) {
        console.error('Database connection error:', error);
        return NextResponse.json(
          { error: 'Failed to connect to database' },
          { status: 500 }
        );
      }
}