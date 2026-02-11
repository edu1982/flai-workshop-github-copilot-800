from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from octofit_tracker.models import User, Team, Activity, Leaderboard, Workout
from bson import ObjectId


class Command(BaseCommand):
    help = 'Populate the octofit_db database with test data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Clearing existing data...')
        
        # Delete all existing data using Django ORM
        User.objects.all().delete()
        Team.objects.all().delete()
        Activity.objects.all().delete()
        Leaderboard.objects.all().delete()
        Workout.objects.all().delete()
        
        self.stdout.write(self.style.SUCCESS('Existing data cleared'))
        
        # Create Teams
        self.stdout.write('Creating teams...')
        team_marvel = Team.objects.create(
            name='Team Marvel',
            description='Earth\'s Mightiest Heroes'
        )
        team_dc = Team.objects.create(
            name='Team DC',
            description='Justice League United'
        )
        self.stdout.write(self.style.SUCCESS(f'Created teams: {team_marvel.name}, {team_dc.name}'))
        
        # Create Users (Superheroes)
        self.stdout.write('Creating users...')
        
        # Team Marvel users
        iron_man = User.objects.create(
            name='Tony Stark',
            email='ironman@marvel.com',
            password='arc_reactor_2024',
            team_id=str(team_marvel._id)
        )
        
        captain_america = User.objects.create(
            name='Steve Rogers',
            email='captainamerica@marvel.com',
            password='shield_forever',
            team_id=str(team_marvel._id)
        )
        
        thor = User.objects.create(
            name='Thor Odinson',
            email='thor@marvel.com',
            password='worthy_mjolnir',
            team_id=str(team_marvel._id)
        )
        
        hulk = User.objects.create(
            name='Bruce Banner',
            email='hulk@marvel.com',
            password='gamma_smash',
            team_id=str(team_marvel._id)
        )
        
        black_widow = User.objects.create(
            name='Natasha Romanoff',
            email='blackwidow@marvel.com',
            password='red_room_spy',
            team_id=str(team_marvel._id)
        )
        
        # Team DC users
        superman = User.objects.create(
            name='Clark Kent',
            email='superman@dc.com',
            password='krypton_power',
            team_id=str(team_dc._id)
        )
        
        batman = User.objects.create(
            name='Bruce Wayne',
            email='batman@dc.com',
            password='dark_knight',
            team_id=str(team_dc._id)
        )
        
        wonder_woman = User.objects.create(
            name='Diana Prince',
            email='wonderwoman@dc.com',
            password='amazon_warrior',
            team_id=str(team_dc._id)
        )
        
        flash = User.objects.create(
            name='Barry Allen',
            email='flash@dc.com',
            password='speed_force',
            team_id=str(team_dc._id)
        )
        
        aquaman = User.objects.create(
            name='Arthur Curry',
            email='aquaman@dc.com',
            password='atlantis_king',
            team_id=str(team_dc._id)
        )
        
        marvel_users = [iron_man, captain_america, thor, hulk, black_widow]
        dc_users = [superman, batman, wonder_woman, flash, aquaman]
        all_users = marvel_users + dc_users
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(all_users)} users'))
        
        # Create Activities
        self.stdout.write('Creating activities...')
        activity_types = ['Running', 'Cycling', 'Swimming', 'Weight Training', 'Boxing', 'Yoga']
        
        activities_created = 0
        for i, user in enumerate(all_users):
            # Each user has 3-5 activities
            num_activities = 3 + (i % 3)
            for j in range(num_activities):
                activity_type = activity_types[j % len(activity_types)]
                duration = 30 + (j * 15)
                calories = duration * 8
                distance = (duration / 60) * 10 if activity_type in ['Running', 'Cycling', 'Swimming'] else None
                
                Activity.objects.create(
                    user_id=str(user._id),
                    activity_type=activity_type,
                    duration=duration,
                    calories_burned=calories,
                    distance=distance,
                    date=timezone.now() - timedelta(days=i, hours=j),
                    notes=f'{user.name} doing {activity_type}'
                )
                activities_created += 1
        
        self.stdout.write(self.style.SUCCESS(f'Created {activities_created} activities'))
        
        # Create Leaderboard entries
        self.stdout.write('Creating leaderboard entries...')
        
        for user in all_users:
            user_activities = Activity.objects.filter(user_id=str(user._id))
            total_activities = user_activities.count()
            total_calories = sum(a.calories_burned for a in user_activities)
            total_distance = sum(a.distance for a in user_activities if a.distance)
            
            team = team_marvel if user.team_id == str(team_marvel._id) else team_dc
            
            Leaderboard.objects.create(
                user_id=str(user._id),
                user_name=user.name,
                team_id=str(team._id),
                team_name=team.name,
                total_activities=total_activities,
                total_calories=total_calories,
                total_distance=total_distance,
                rank=0  # Will be calculated based on total_calories
            )
        
        # Update rankings based on total_calories
        leaderboard_entries = Leaderboard.objects.all().order_by('-total_calories')
        for rank, entry in enumerate(leaderboard_entries, start=1):
            entry.rank = rank
            entry.save()
        
        self.stdout.write(self.style.SUCCESS(f'Created {leaderboard_entries.count()} leaderboard entries'))
        
        # Create Workouts
        self.stdout.write('Creating workouts...')
        
        workouts_data = [
            {
                'name': 'Super Soldier Training',
                'description': 'High-intensity workout inspired by Captain America',
                'category': 'Strength',
                'difficulty_level': 'Advanced',
                'estimated_duration': 60,
                'estimated_calories': 500
            },
            {
                'name': 'Asgardian Power Lift',
                'description': 'Weightlifting routine fit for a god',
                'category': 'Strength',
                'difficulty_level': 'Expert',
                'estimated_duration': 45,
                'estimated_calories': 400
            },
            {
                'name': 'Speed Force Cardio',
                'description': 'Lightning-fast cardio workout',
                'category': 'Cardio',
                'difficulty_level': 'Intermediate',
                'estimated_duration': 30,
                'estimated_calories': 350
            },
            {
                'name': 'Bat Cave HIIT',
                'description': 'High-intensity interval training in the shadows',
                'category': 'HIIT',
                'difficulty_level': 'Advanced',
                'estimated_duration': 40,
                'estimated_calories': 450
            },
            {
                'name': 'Amazonian Warrior Yoga',
                'description': 'Flexibility and strength from Themyscira',
                'category': 'Flexibility',
                'difficulty_level': 'Beginner',
                'estimated_duration': 50,
                'estimated_calories': 200
            },
            {
                'name': 'Arc Reactor Endurance',
                'description': 'Tony Stark\'s personal endurance routine',
                'category': 'Endurance',
                'difficulty_level': 'Intermediate',
                'estimated_duration': 55,
                'estimated_calories': 380
            },
            {
                'name': 'Hulk Smash Circuit',
                'description': 'Power-packed circuit training',
                'category': 'Circuit',
                'difficulty_level': 'Expert',
                'estimated_duration': 35,
                'estimated_calories': 480
            },
            {
                'name': 'Atlantean Swimming',
                'description': 'Under the sea swimming workout',
                'category': 'Cardio',
                'difficulty_level': 'Intermediate',
                'estimated_duration': 45,
                'estimated_calories': 320
            }
        ]
        
        for workout_data in workouts_data:
            Workout.objects.create(**workout_data)
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(workouts_data)} workouts'))
        
        # Summary
        self.stdout.write(self.style.SUCCESS('\n=== Database Population Complete ==='))
        self.stdout.write(f'Teams: {Team.objects.count()}')
        self.stdout.write(f'Users: {User.objects.count()}')
        self.stdout.write(f'Activities: {Activity.objects.count()}')
        self.stdout.write(f'Leaderboard Entries: {Leaderboard.objects.count()}')
        self.stdout.write(f'Workouts: {Workout.objects.count()}')
