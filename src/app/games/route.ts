import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Game from '@/models/Game';

export async function GET(request: Request) {
    try {
        //Connect to database
        await connectToDatabase();

        //Get URL params
        const { searchParams } = new URL(request.url);
        const lat = parseFloat(searchParams.get('lat') || '0');
        const lng = parseFloat(searchParams.get('lng') || '0');
        const radius = parseFloat(searchParams.get('radius') || '10000'); //10km default

        let query = {};

        //Add geospatial query if coords provided
        if (lat && lng) {
            query = {
                'location.coordinates': {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [lng, lat], //GeoJSON format requires [longitute, latitude]
                        },
                        $maxDistance: radius,
                    },
                },
            };
        }

        //Fetch games from db
        const games = await Game.find(query)
                        .sort({ dateTime: 1 })
                        .limit(50)
                        .populate('organizer', 'name email');

        return NextResponse.json(games)
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch games' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // Connect to db
        await connectToDatabase();

        //Get request body
        const data = await request.json();

        //Create new game
        const game = new Game(data);
        await game.save();

        return NextResponse.json(game, { status: 201 });
    } catch (error) {
        console.error('Database error:' , error);
        return NextResponse.json(
            { error: 'Failed to create game' },
            { status: 500 }
        );
    }
}