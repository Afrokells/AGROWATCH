import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import User
from farms.models import Farm
from scans.models import Scan, Detection
from market.models import MarketListing
from expert.models import DiseaseCondition

class Command(BaseCommand):
    help = 'Seed database with comprehensive mock data'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting DB Seeder...")

        # 1. Create Superuser
        if not User.objects.filter(username='admin').exists():
            admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'admin', phone_number='admin', user_role='admin')
            admin_user.user_role = 'admin'
            admin_user.save()
            self.stdout.write("Created superuser: admin")

        # 2. Create Users
        farmer1, _ = User.objects.get_or_create(
            phone_number='+233241234567',
            defaults={
                'username': 'farmer1',
                'full_name': 'Kwame Asante',
                'user_role': 'farmer',
                'region': 'Volta Region',
                'district': 'Ho'
            }
        )

        buyer1, _ = User.objects.get_or_create(
            phone_number='+233201234567',
            defaults={
                'username': 'buyer1',
                'full_name': 'Abena Mensah',
                'user_role': 'buyer',
                'region': 'Greater Accra',
                'district': 'Accra Metropolitan'
            }
        )
        
        farmer2, _ = User.objects.get_or_create(
            phone_number='+233201234568',
            defaults={
                'username': 'farmer2',
                'full_name': 'Adwoa Darko',
                'user_role': 'farmer',
                'region': 'Volta Region',
                'district': 'Jasikan'
            }
        )

        farmer3, _ = User.objects.get_or_create(
            phone_number='+233201234569',
            defaults={
                'username': 'farmer3',
                'full_name': 'Yaw Boateng',
                'user_role': 'farmer',
                'region': 'Volta Region',
                'district': 'Kpando'
            }
        )

        farmer4, _ = User.objects.get_or_create(
            phone_number='+233201234570',
            defaults={
                'username': 'farmer4',
                'full_name': 'Kofi Dzakpasu',
                'user_role': 'farmer',
                'region': 'Volta Region',
                'district': 'Hohoe'
            }
        )

        farmer5, _ = User.objects.get_or_create(
            phone_number='+233201234571',
            defaults={
                'username': 'farmer5',
                'full_name': 'Ama Fiagbey',
                'user_role': 'farmer',
                'region': 'Volta Region',
                'district': 'Keta'
            }
        )

        # 3. Create Farms
        farm1, _ = Farm.objects.get_or_create(
            farm_name='Asante Family Farm',
            defaults={'farmer': farmer1, 'crop_type': 'tomato', 'district': 'Ho', 'region': 'Volta Region', 'area_ha': 1.5}
        )
        farm2, _ = Farm.objects.get_or_create(
            farm_name='North Field',
            defaults={'farmer': farmer1, 'crop_type': 'maize', 'district': 'Hohoe', 'region': 'Volta Region', 'area_ha': 2.0}
        )
        farm3, _ = Farm.objects.get_or_create(
            farm_name='Riverside Pineapple Plot',
            defaults={'farmer': farmer3, 'crop_type': 'pineapple', 'district': 'Kpando', 'region': 'Volta Region', 'area_ha': 0.8}
        )

        # 4. Create Disease Conditions
        DISEASES = [
            {'crop_type': 'tomato', 'condition_id': 'tomato_healthy', 'label': 'Healthy', 'severity': 'none'},
            {'crop_type': 'tomato', 'condition_id': 'tomato_late_blight', 'label': 'Late Blight', 'severity': 'high'},
            {'crop_type': 'tomato', 'condition_id': 'tomato_leaf_curl', 'label': 'Leaf Curl Virus', 'severity': 'high'},
            {'crop_type': 'tomato', 'condition_id': 'tomato_septoria', 'label': 'Septoria Leaf Spot', 'severity': 'medium'},
            {'crop_type': 'tomato', 'condition_id': 'tomato_bacterial_spot', 'label': 'Bacterial Spot', 'severity': 'medium'},
            
            {'crop_type': 'maize', 'condition_id': 'maize_healthy', 'label': 'Healthy', 'severity': 'none'},
            {'crop_type': 'maize', 'condition_id': 'maize_fall_armyworm', 'label': 'Fall Armyworm', 'severity': 'high'},
            {'crop_type': 'maize', 'condition_id': 'maize_northern_blight', 'label': 'Northern Leaf Blight', 'severity': 'medium'},
            {'crop_type': 'maize', 'condition_id': 'maize_common_rust', 'label': 'Common Rust', 'severity': 'medium'},
            {'crop_type': 'maize', 'condition_id': 'maize_grey_leaf_spot', 'label': 'Gray Leaf Spot', 'severity': 'medium'},
            
            {'crop_type': 'pineapple', 'condition_id': 'pineapple_healthy', 'label': 'Healthy', 'severity': 'none'},
            {'crop_type': 'pineapple', 'condition_id': 'pineapple_mealybug_wilt', 'label': 'Mealybug Wilt', 'severity': 'high'},
            {'crop_type': 'pineapple', 'condition_id': 'pineapple_heart_rot', 'label': 'Heart Rot', 'severity': 'high'},
        ]
        
        for d in DISEASES:
            DiseaseCondition.objects.get_or_create(
                condition_id=d['condition_id'],
                defaults={
                    'crop_type': d['crop_type'],
                    'label': d['label'],
                    'severity': d['severity'],
                    'description': 'Auto-generated description',
                    'recommendation': 'Auto-generated recommendation'
                }
            )

        # 5. Create Scans
        scan1, _ = Scan.objects.get_or_create(
            farm=farm1,
            defaults={
                'crop_type': 'tomato', 'status': 'completed', 'total_plants': 342,
                'disease_flags': 18, 'precision': 0.89, 'recall': 0.85, 'f1_score': 0.87, 'image_count': 4
            }
        )
        scan2, _ = Scan.objects.get_or_create(
            farm=farm2,
            defaults={
                'crop_type': 'maize', 'status': 'completed', 'total_plants': 518,
                'disease_flags': 32, 'precision': 0.87, 'recall': 0.83, 'f1_score': 0.85, 'image_count': 6
            }
        )
        scan3, _ = Scan.objects.get_or_create(
            farm=farm3,
            defaults={
                'crop_type': 'pineapple', 'status': 'completed', 'total_plants': 198,
                'disease_flags': 11, 'precision': 0.85, 'recall': 0.81, 'f1_score': 0.83, 'image_count': 3
            }
        )

        # 6. Create Listings
        LISTINGS = [
            {'farmer': farmer1, 'crop_type': 'tomato', 'quantity_kg': 250, 'asking_price_ghs': 8.50, 'harvest_date': '2025-05-10', 'description': 'Fresh Roma tomatoes, grade A.'},
            {'farmer': farmer1, 'crop_type': 'maize', 'quantity_kg': 500, 'asking_price_ghs': 3.20, 'harvest_date': '2025-05-15', 'description': 'Dried maize cobs, ready for processing.'},
            {'farmer': farmer3, 'crop_type': 'pineapple', 'quantity_kg': 180, 'asking_price_ghs': 5.00, 'harvest_date': '2025-05-08', 'description': 'MD2 Golden pineapples, sweet and ready.'},
            {'farmer': farmer2, 'crop_type': 'tomato', 'quantity_kg': 120, 'asking_price_ghs': 9.00, 'harvest_date': '2025-05-12', 'description': 'Cherry tomatoes, organic farming practices.'},
            {'farmer': farmer4, 'crop_type': 'maize', 'quantity_kg': 800, 'asking_price_ghs': 2.80, 'harvest_date': '2025-05-20', 'description': 'White maize, bulk available.'},
            {'farmer': farmer5, 'crop_type': 'pineapple', 'quantity_kg': 320, 'asking_price_ghs': 4.50, 'harvest_date': '2025-05-18', 'description': 'Large pineapples, ready to harvest.'},
        ]
        
        for l in LISTINGS:
            MarketListing.objects.get_or_create(
                farmer=l['farmer'],
                crop_type=l['crop_type'],
                quantity_kg=l['quantity_kg'],
                defaults={
                    'asking_price_ghs': l['asking_price_ghs'],
                    'harvest_date': l['harvest_date'],
                    'listing_status': 'active',
                    'description': l['description']
                }
            )

        self.stdout.write(self.style.SUCCESS("Database seeded with ALL comprehensive data successfully!"))
