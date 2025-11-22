from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import bcrypt
from datetime import datetime, timedelta
import os

app = Flask(__name__, static_folder='../frontend', static_url_path='')
app.secret_key = 'a_very_long_and_random_key_for_meditrack_2025_574F9B2C'  # Change this to a random secret key
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
CORS(app, 
     resources={
         r"/*": {
             "origins": ["http://localhost:5000","http://127.0.0.1:5000","null"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             "allow_headers": ["Content-Type", "Authorization", "User-id"],
             "supports_credentials": True
             
         }
     })  # Enable CORS for all routes

# Database configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Hussain.23',
    'database': 'SmartHealthReminder'
}

def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# Handle preflight requests
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://127.0.0.1:5000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,User-Id')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Helper function to hash passwords
def hash_password(password):
    # Return a UTF-8 string so it is stored consistently in the DB
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Helper function to check password
def check_password(hashed_password, user_password):
    # hashed_password may be stored in the DB as bytes or as a string.
    # Ensure we pass bytes to bcrypt.checkpw.
    if isinstance(hashed_password, bytes):
        hashed = hashed_password
    else:
        # assume string
        hashed = hashed_password.encode('utf-8')
    return bcrypt.checkpw(user_password.encode('utf-8'), hashed)

def is_bcrypt_hash(s):
    """Return True if s looks like a bcrypt hash string."""
    try:
        return isinstance(s, str) and s.startswith('$2')
    except Exception:
        return False

def get_authenticated_user_id():
    """Get user ID from session or from Authorization header"""
    # First try session (for traditional login)
    if 'user_id' in session:
        print(f"✅ Authenticated via session: user_id {session['user_id']}")
        return session['user_id']
    
    # Fallback to header (for API calls)
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        try:
            user_id = int(auth_header.replace('Bearer ', ''))
            print(f"✅ Authenticated via header: user_id {user_id}")
            return int(auth_header.replace('Bearer ', ''))
        except ValueError:
            print("❌ Invalid user ID in Authorization header")
            pass
    print("❌ No authentication found")
    return None
@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/debug-session', methods=['GET'])
def debug_session():
    return jsonify({
        'user_id_in_session': session.get('user_id'),
        'session_keys': list(session.keys()),
        'authenticated': 'user_id' in session
    }), 200

@app.route('/api/debug-user', methods=['GET'])
def debug_user():
    user_id = get_authenticated_user_id()
    return jsonify({
        'authenticated_user_id': user_id,
        'session_user_id': session.get('user_id'),
        'session_data': dict(session)
    }), 200

# Signup endpoint
@app.route('/signup', methods=['POST'])
def signup():
    print("=== SIGNUP REQUEST RECEIVED ===")  # Debug line
    data = request.json
    print(f"Received data: {data}")  # Debug line
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'client')  # Default to 'client'
    print(f"Processing: {name}, {email}")  # Debug line
    
    
    # Additional client fields
    age = data.get('age')
    gender = data.get('gender')
    contact = data.get('contact')
    
    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor()
        
        # Check if email already exists
        cursor.execute("SELECT email FROM User WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"error": "Email already exists"}), 400
        
        # Hash password
        hashed_password = hash_password(password)
        
        # Insert into User table
        cursor.execute(
            "INSERT INTO User (name, email, password, role) VALUES (%s, %s, %s, %s)",
            (name, email, hashed_password, role)
        )
        user_id = cursor.lastrowid
        
        # If user is client, insert into Client table
        if role == 'client' and user_id:
            cursor.execute(
                "INSERT INTO Client (client_id, age, gender, contact) VALUES (%s, %s, %s, %s)",
                (user_id, age, gender, contact)
            )
        
        connection.commit()
        
        return jsonify({
            "message": "User created successfully",
            "user_id": user_id,
            "role": role
        }), 201
        
    except Error as e:
        connection.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()

# Login endpoint
@app.route('/login', methods=['POST'])
def login():
    print("=== LOGIN REQUEST RECEIVED ===")
    data = request.json
    print(f"Login data: {data}")
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get user from database
        cursor.execute("""
            SELECT user_id, name, email, password, role 
            FROM User 
            WHERE email = %s
        """, (email,))
        
        user = cursor.fetchone()

        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        stored_password = user.get('password')

        password_ok = False

        # If stored password looks like a bcrypt hash, verify normally.
        if is_bcrypt_hash(stored_password):
            try:
                password_ok = check_password(stored_password, password)
            except Exception as e:
                print('Password check error (hashed):', e)
                password_ok = False
        else:
            # Stored password is not hashed (plaintext). Compare directly and migrate to bcrypt.
            print('⚠️ Detected plaintext password in DB for user:', user.get('user_id'))
            if stored_password == password:
                password_ok = True
                try:
                    new_hashed = hash_password(password)
                    cursor.execute(
                        "UPDATE User SET password = %s WHERE user_id = %s",
                        (new_hashed, user['user_id'])
                    )
                    connection.commit()
                    print('🔁 Migrated plaintext password to bcrypt for user', user.get('user_id'))
                except Exception as e:
                    connection.rollback()
                    print('Failed to migrate plaintext password:', e)

        if not password_ok:
            return jsonify({"error": "Invalid email or password"}), 401

        # Update last login for admin
        if user['role'] == 'admin':
            cursor.execute(
                "UPDATE Admin SET last_login = %s WHERE admin_id = %s",
                (datetime.now(), user['user_id'])
            )
            connection.commit()
        
        # Store user info in session
        session['user_id'] = user['user_id']
        session['email'] = user['email']
        session['role'] = user['role']
        session['name'] = user['name']
        
        return jsonify({
            "message": "Login successful",
            "user": {
                "user_id": user['user_id'],
                "name": user['name'],
                "email": user['email'],
                "role": user['role']
            }
        }), 200
        
    except Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()

# Logout endpoint
@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logout successful"}), 200

# Check authentication status
@app.route('/check-auth', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        return jsonify({
            "authenticated": True,
            "user": {
                "user_id": session['user_id'],
                "name": session['name'],
                "email": session['email'],
                "role": session['role']
            }
        }), 200
    else:
        return jsonify({"authenticated": False}), 200
    
@app.route('/api/medications', methods=['GET'])
def get_medications():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # SIMPLE: Just get medications without complex joins
        cursor.execute("""
            SELECT 
                m.medicine_id as id,
                m.name,
                m.dosage,
                m.note as notes
            FROM Medicine m
            WHERE m.client_id = %s
            ORDER BY m.name
        """, (user_id,))
        
        medications = cursor.fetchall()
        
        # Now get the most recent reminder for each medication
        formatted_medications = []
        for med in medications:
            # Get the most recent reminder for this medication
            cursor.execute("""
                SELECT reminder_time as time, status
                FROM Reminder 
                WHERE medicine_id = %s 
                ORDER BY reminder_time DESC 
                LIMIT 1
            """, (med['id'],))
            
            reminder = cursor.fetchone()
            
            if reminder and reminder['time']:
                formatted_medications.append({
                    'id': med['id'],
                    'name': med['name'],
                    'dosage': med['dosage'],
                    'notes': med['notes'] or '',
                    'time': str(reminder['time']),
                    'status': reminder['status'] or 'Pending'
                })
        
        print(f"✅ Returning {len(formatted_medications)} unique medications")
        return jsonify({"medications": formatted_medications}), 200
        
    except Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()
@app.route('/api/medications/monthly', methods=['GET'])
def get_monthly_medications():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    year = request.args.get('year')
    month = request.args.get('month')
    
    if not year or not month:
        return jsonify({"error": "Year and month parameters are required"}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT DAY(r.reminder_time) as day, 
                   m.name, m.dosage, r.reminder_time as schedule_time, m.note as notes
            FROM Medicine m
            JOIN Reminder r ON m.medicine_id = r.medicine_id
            WHERE m.client_id = %s 
            AND YEAR(r.reminder_time) = %s 
            AND MONTH(r.reminder_time) = %s
            ORDER BY r.reminder_time
        """, (user_id, year, month))
        
        medications = cursor.fetchall()
        
        monthly_data = {}
        for med in medications:
            day = med['day']
            time_str = str(med['schedule_time'])
            
            hour = int(time_str.split(' ')[1].split(':')[0])
            if 6 <= hour < 12:
                time_period = 'morning'
            elif 12 <= hour < 18:
                time_period = 'afternoon'
            elif 18 <= hour < 22:
                time_period = 'evening'
            else:
                time_period = 'night'
            
            if day not in monthly_data:
                monthly_data[day] = []
            
            monthly_data[day].append({
                'name': med['name'],
                'time': time_period,
                'dosage': med['dosage'],
                'icon': get_medication_icon(med['name'])
            })
        
        return jsonify({"medications": monthly_data}), 200
        
    except Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()
def get_medication_icon(medication_name):
    """Helper function to determine icon based on medication name"""
    name_lower = medication_name.lower()
    if 'vitamin' in name_lower:
        return 'fa-apple-alt'
    elif 'aspirin' in name_lower or 'pain' in name_lower:
        return 'fa-pills'
    elif 'blood' in name_lower or 'pressure' in name_lower:
        return 'fa-heartbeat'
    elif 'allergy' in name_lower:
        return 'fa-wind'
    elif 'antibiotic' in name_lower:
        return 'fa-bacteria'
    elif 'sleep' in name_lower:
        return 'fa-moon'
    elif 'calcium' in name_lower or 'bone' in name_lower:
        return 'fa-bone'
    else:
        return 'fa-capsules'

@app.route('/api/medications', methods=['POST'])
def add_medication():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.json
    
    name = data.get('name')
    dosage = data.get('dosage')
    time_str = data.get('time')  # Time in "HH:MM" format
    start_date_str = data.get('start_date')  # "YYYY-MM-DD"
    end_date_str = data.get('end_date')  # "YYYY-MM-DD"
    frequency = data.get('frequency', 'daily')  # daily, weekly, monthly
    notes = data.get('notes')
    
    if not name or not dosage or not time_str or not start_date_str:
        return jsonify({"error": "Name, dosage, start date, and time are required"}), 400
    
    print(f"🔍 Adding medication for user {user_id}: {name}, {dosage}, time: {time_str}, start: {start_date_str}, end: {end_date_str}, frequency: {frequency}")
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor()
        
        # Insert into Medicine table
        cursor.execute("""
            INSERT INTO Medicine (client_id, name, dosage, note)
            VALUES (%s, %s, %s, %s)
        """, (user_id, name, dosage, notes))
        
        medicine_id = cursor.lastrowid
        
        # Parse dates and time
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d') if end_date_str else None
        
        # If no end date, set it to start date (one-time medication)
        if not end_date:
            end_date = start_date
        
        # Create reminders based on frequency
        reminders_created = 0
        current_date = start_date
        
        while current_date <= end_date:
            # Combine date with time
            reminder_datetime = datetime.combine(current_date.date(), 
                                               datetime.strptime(time_str, '%H:%M').time())
            
            # Insert reminder
            cursor.execute("""
                INSERT INTO Reminder (medicine_id, reminder_time, status)
                VALUES (%s, %s, 'Pending')
            """, (medicine_id, reminder_datetime.strftime('%Y-%m-%d %H:%M:%S')))
            
            reminders_created += 1
            
            # Move to next date based on frequency
            if frequency == 'daily':
                current_date += timedelta(days=1)
            elif frequency == 'weekly':
                current_date += timedelta(weeks=1)
            elif frequency == 'monthly':
                # Add approximately one month
                next_month = current_date.month + 1
                next_year = current_date.year
                if next_month > 12:
                    next_month = 1
                    next_year += 1
                # Simple month addition - for exact date handling you might want more complex logic
                current_date = current_date.replace(year=next_year, month=next_month)
            else:  # one-time
                break
        
        connection.commit()
        
        print(f"✅ Medication added successfully with ID: {medicine_id}, {reminders_created} reminders created")
        
        return jsonify({
            "success": True,
            "message": f"Medication added successfully with {reminders_created} reminders",
            "medicine_id": medicine_id,
            "reminders_created": reminders_created
        }), 201
        
    except Error as e:
        connection.rollback()
        print(f"💥 Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/medications/<int:medication_id>', methods=['DELETE'])
def delete_medication(medication_id):
    try:
        # Get user from authentication (you'll need to implement this based on your auth system)
        user_id = get_authenticated_user_id()  # Replace with your actual auth function
        
        # Get database connection
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Verify the medication belongs to the user
        cursor.execute(
            'SELECT * FROM Medicine WHERE medicine_id = %s AND client_id = %s',
            (medication_id, user_id)
        )
        medication = cursor.fetchone()
        
        if not medication:
            cursor.close()
            connection.close()
            return jsonify({'success': False, 'error': 'Medication not found'}), 404
        
        # Delete the medication
        cursor.execute(
            'DELETE FROM Medicine WHERE medicine_id = %s AND client_id = %s',
            (medication_id, user_id)
        )
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({'success': True, 'message': 'Medication deleted successfully'})
        
    except Exception as e:
        print('Delete medication error:', e)
        return jsonify({'success': False, 'error': 'Server error'}), 500  

@app.route('/api/medications/<int:medicine_id>/status', methods=['PUT'])
def update_medication_status(medicine_id):
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({"success": False, "error": "Not authenticated"}), 401
    
    data = request.json
    status = data.get('status')
    
    print(f"🔄 Updating medication {medicine_id} status to {status} for user {user_id}")
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"success": False, "error": "Database connection failed"}), 500
    
    cursor = None
    try:
        # Create a new cursor for the first query
        cursor = connection.cursor(dictionary=True, buffered=True)  # Add buffered=True
        
        # First, verify the medication belongs to the user and get reminder_id
        cursor.execute("""
            SELECT m.medicine_id, r.reminder_id 
            FROM Medicine m 
            INNER JOIN Reminder r ON m.medicine_id = r.medicine_id 
            WHERE m.medicine_id = %s AND m.client_id = %s
            AND DATE(r.reminder_time) = CURDATE()
        """, (medicine_id, user_id))
        
        medication = cursor.fetchone()
        
        # IMPORTANT: Close this cursor and create a new one to avoid "Unread result found"
        cursor.close()
        
        if not medication:
            print(f"❌ Medication {medicine_id} not found for user {user_id} or not today's medication")
            return jsonify({"success": False, "error": "Medicine not found or access denied"}), 404
        
        reminder_id = medication['reminder_id']
        print(f"✅ Found reminder_id: {reminder_id} for medicine_id: {medicine_id}")
        
        # Create a NEW cursor for the update operations
        cursor = connection.cursor(dictionary=True)
        
        # Update reminder status
        if status == 'taken':
            new_status = 'Completed'
            log_action = 'Taken'
        else:
            new_status = 'Pending'
            log_action = None
        
        print(f"📝 Updating reminder {reminder_id} to status: {new_status}")
        
        cursor.execute("""
            UPDATE Reminder 
            SET status = %s 
            WHERE reminder_id = %s
        """, (new_status, reminder_id))
        
        # Optional: Log the action if taken (only if Log table exists)
        if status == 'taken' and log_action:
            try:
                # Check if Log table exists first
                cursor.execute("SHOW TABLES LIKE 'Log'")
                log_table_exists = cursor.fetchone()
                
                if log_table_exists:
                    print(f"📝 Logging action for reminder {reminder_id}")
                    cursor.execute("""
                        INSERT INTO Log (reminder_id, action) 
                        VALUES (%s, %s)
                    """, (reminder_id, log_action))
                else:
                    print("ℹ️ Log table doesn't exist, skipping logging")
            except Error as log_error:
                print(f"⚠️ Could not log action: {log_error}")
                # Continue anyway - don't fail the whole request
        
        connection.commit()
        print(f"✅ Successfully updated medication status")
        
        return jsonify({
            "success": True,
            "message": "Medication status updated successfully"
        }), 200
        
    except Error as e:
        if connection:
            connection.rollback()
        print(f"💥 Database error: {str(e)}")
        return jsonify({"success": False, "error": f"Database error: {str(e)}"}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
            
# My Medications API Endpoints
@app.route('/api/my-medications', methods=['GET'])
def get_my_medications():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # FIXED: Use DISTINCT and remove the JOIN that causes duplicates
        cursor.execute("""
            SELECT DISTINCT
                m.medicine_id as id,
                m.name,
                m.dosage,
                m.note as notes,
                (SELECT MAX(r.reminder_time) FROM Reminder r WHERE r.medicine_id = m.medicine_id) as latest_time,
                (SELECT r.status FROM Reminder r WHERE r.medicine_id = m.medicine_id ORDER BY r.reminder_time DESC LIMIT 1) as status,
                d.name as prescriber,
                d.specialization as purpose
            FROM Medicine m
            LEFT JOIN Doctor d ON m.client_id = d.client_id
            WHERE m.client_id = %s
            ORDER BY m.name
        """, (user_id,))
        
        medications = cursor.fetchall()
        
        # Format the medications data
        formatted_medications = []
        for med in medications:
            # Calculate refills based on some logic
            refills = 3  # Default value
            
            formatted_medications.append({
                'id': med['id'],
                'name': med['name'],
                'dosage': med['dosage'],
                'frequency': 'Once daily',
                'purpose': med['purpose'] or 'General Health',
                'prescriber': med['prescriber'] or 'Dr. Unknown',
                'startDate': med['latest_time'].strftime('%Y-%m-%d') if med['latest_time'] else datetime.now().strftime('%Y-%m-%d'),
                'refills': refills,
                'notes': med['notes'] or '',
                'status': med['status'] or 'Pending'
            })
        
        print(f"✅ Returning {len(formatted_medications)} UNIQUE medications")
        return jsonify({"medications": formatted_medications}), 200
        
    except Error as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()

# Add this function to your app.py
def mark_missed_medications():
    """Mark medications as missed if their time has passed"""
    connection = get_db_connection()
    if not connection:
        print("❌ Failed to connect to database for marking missed medications")
        return
    
    try:
        cursor = connection.cursor()
        
        # Update reminders that are past due and still pending
        cursor.execute("""
            UPDATE Reminder 
            SET status = 'Missed' 
            WHERE status = 'Pending' 
            AND reminder_time < NOW()
        """)
        
        connection.commit()
        print(f"📝 Marked missed medications: {cursor.rowcount}")
        
    except Error as e:
        print(f"❌ Error marking missed medications: {e}")
        # Don't raise the exception, just log it
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# Call this function before fetching medications
@app.route('/api/medications/today', methods=['GET'])
def get_today_medications():
    try:
        # Mark missed medications first (with error handling)
        try:
            mark_missed_medications()
        except Exception as e:
            print(f"⚠️ Warning: Could not mark missed medications: {e}")
            # Continue anyway - don't let this break the entire endpoint
        
        user_id = get_authenticated_user_id()
        print(f"🔍 TODAY'S MEDS - User ID: {user_id}")
        
        if not user_id:
            return jsonify({"error": "Not authenticated"}), 401
        
        print(f"🔍 Fetching today's medications for user {user_id}")
        
        connection = get_db_connection()
        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Debug: Print the current date for reference
            cursor.execute("SELECT CURDATE() as today")
            today = cursor.fetchone()
            print(f"📅 Today's date in DB: {today['today']}")
            
            cursor.execute("""
                SELECT 
                    m.medicine_id as id,
                    m.name,
                    m.dosage,
                    m.note as notes,
                    r.reminder_time as time,
                    r.status,
                    r.reminder_id
                FROM Medicine m
                INNER JOIN Reminder r ON m.medicine_id = r.medicine_id
                WHERE m.client_id = %s 
                AND DATE(r.reminder_time) = CURDATE()
                ORDER BY r.reminder_time
            """, (user_id,))
            
            medications = cursor.fetchall()
            print(f"📦 Found {len(medications)} medications for today")
            
            formatted_medications = []
            for med in medications:
                print(f"💊 Today's med: {med['name']} at {med['time']} (status: {med['status']})")
                
                formatted_medications.append({
                    'id': med['id'],
                    'name': med['name'],
                    'dosage': med['dosage'],
                    'notes': med['notes'] or '',
                    'time': str(med['time']),
                    'status': med['status'].lower() if med['status'] else 'pending',
                    'reminder_id': med['reminder_id']
                })
            
            print(f"✅ Returning {len(formatted_medications)} formatted medications")
            return jsonify({"success": True, "medications": formatted_medications}), 200
            
        except Error as e:
            print(f"💥 Database error in get_today_medications: {str(e)}")
            return jsonify({"success": False, "error": f"Database error: {str(e)}"}), 500
        finally:
            if cursor:
                cursor.close()
            if connection:
                connection.close()
                
    except Exception as e:
        print(f"💥 Unexpected error in get_today_medications: {str(e)}")
        return jsonify({"success": False, "error": f"Unexpected error: {str(e)}"}), 500
@app.route('/api/my-medications/search', methods=['GET'])
def search_my_medications():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    search_term = request.args.get('q', '')
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # FIXED: Use the same DISTINCT query for search
        cursor.execute("""
            SELECT DISTINCT
                m.medicine_id as id,
                m.name,
                m.dosage,
                m.note as notes,
                (SELECT MAX(r.reminder_time) FROM Reminder r WHERE r.medicine_id = m.medicine_id) as latest_time,
                (SELECT r.status FROM Reminder r WHERE r.medicine_id = m.medicine_id ORDER BY r.reminder_time DESC LIMIT 1) as status,
                d.name as prescriber,
                d.specialization as purpose
            FROM Medicine m
            LEFT JOIN Doctor d ON m.client_id = d.client_id
            WHERE m.client_id = %s AND m.name LIKE %s
            ORDER BY m.name
        """, (user_id, f'%{search_term}%'))
        
        medications = cursor.fetchall()
        
        # Format the medications data
        formatted_medications = []
        for med in medications:
            refills = 3
            
            formatted_medications.append({
                'id': med['id'],
                'name': med['name'],
                'dosage': med['dosage'],
                'frequency': 'Once daily',
                'purpose': med['purpose'] or 'General Health',
                'prescriber': med['prescriber'] or 'Dr. Unknown',
                'startDate': med['latest_time'].strftime('%Y-%m-%d') if med['latest_time'] else datetime.now().strftime('%Y-%m-%d'),
                'refills': refills,
                'notes': med['notes'] or '',
                'status': med['status'] or 'Pending'
            })
        
        return jsonify({"medications": formatted_medications}), 200
        
    except Error as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/medications/reminders', methods=['GET'])
def get_all_reminders():
    """Get ALL reminders for calendar display"""
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get ALL reminders (not grouped by medicine)
        cursor.execute("""
            SELECT 
                m.medicine_id,
                m.name,
                m.dosage,
                m.note as notes,
                r.reminder_time,
                r.status,
                r.reminder_id
            FROM Medicine m
            INNER JOIN Reminder r ON m.medicine_id = r.medicine_id
            WHERE m.client_id = %s 
            ORDER BY r.reminder_time
        """, (user_id,))
        
        reminders = cursor.fetchall()
        print(f"📅 Found {len(reminders)} total reminders for user {user_id}")
        
        return jsonify({"success": True, "reminders": reminders}), 200
        
    except Error as e:
        print(f"💥 Database error: {str(e)}")
        return jsonify({"success": False, "error": f"Database error: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()

# Fix the authentication issue in existing endpoints
def get_authenticated_user_id():
    """Get user ID from session or from Authorization header"""
    # First try session (for traditional login)
    if 'user_id' in session:
        print(f"✅ Authenticated via session: user_id {session['user_id']}")
        return session['user_id']
    
    # Fallback to header (for API calls)
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        try:
            user_id = int(auth_header.replace('Bearer ', ''))
            print(f"✅ Authenticated via header: user_id {user_id}")
            return user_id
        except ValueError:
            print("❌ Invalid user ID in Authorization header")
            pass
    
    # Also check for user_id in request headers directly
    user_id_header = request.headers.get('User-Id')
    if user_id_header:
        try:
            user_id = int(user_id_header)
            print(f"✅ Authenticated via User-Id header: user_id {user_id}")
            return user_id
        except ValueError:
            print("❌ Invalid user ID in User-Id header")
            pass
    
    print("❌ No authentication found")
    return None

# ==================== DOCTORS ENDPOINTS ====================

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT doctor_id as id, name, specialization as specialty, contact as phone
            FROM Doctor 
            WHERE client_id = %s
            ORDER BY name
        """, (user_id,))
        
        doctors = cursor.fetchall()
        
        return jsonify({
            "success": True,
            "doctors": doctors
        }), 200
        
    except Error as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/doctors', methods=['POST'])
def add_doctor():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.json
    
    name = data.get('name')
    specialty = data.get('specialty')
    phone = data.get('phone')
    email = data.get('email')  # Note: Your table doesn't have email column
    address = data.get('address')  # Note: Your table doesn't have address column
    
    if not name:
        return jsonify({"error": "Doctor name is required"}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor()
        
        cursor.execute("""
            INSERT INTO Doctor (client_id, name, specialization, contact)
            VALUES (%s, %s, %s, %s)
        """, (user_id, name, specialty, phone))
        
        doctor_id = cursor.lastrowid
        connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Doctor added successfully",
            "doctor_id": doctor_id
        }), 201
        
    except Error as e:
        connection.rollback()
        print(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/doctors/<int:doctor_id>', methods=['PUT'])
def update_doctor(doctor_id):
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.json
    
    name = data.get('name')
    specialty = data.get('specialty')
    phone = data.get('phone')
    
    if not name:
        return jsonify({"error": "Doctor name is required"}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor()
        
        # Check if doctor belongs to user
        cursor.execute("SELECT client_id FROM Doctor WHERE doctor_id = %s", (doctor_id,))
        doctor = cursor.fetchone()
        
        if not doctor or doctor[0] != user_id:
            return jsonify({"error": "Doctor not found or access denied"}), 404
        
        cursor.execute("""
            UPDATE Doctor 
            SET name = %s, specialization = %s, contact = %s
            WHERE doctor_id = %s
        """, (name, specialty, phone, doctor_id))
        
        connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Doctor updated successfully"
        }), 200
        
    except Error as e:
        connection.rollback()
        print(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/doctors/<int:doctor_id>', methods=['DELETE'])
def delete_doctor(doctor_id):
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor()
        
        # Check if doctor belongs to user
        cursor.execute("SELECT client_id FROM Doctor WHERE doctor_id = %s", (doctor_id,))
        doctor = cursor.fetchone()
        
        if not doctor or doctor[0] != user_id:
            return jsonify({"error": "Doctor not found or access denied"}), 404
        
        cursor.execute("DELETE FROM Doctor WHERE doctor_id = %s", (doctor_id,))
        
        connection.commit()
        
        return jsonify({
            "success": True,
            "message": "Doctor deleted successfully"
        }), 200
        
    except Error as e:
        connection.rollback()
        print(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        cursor.close()
        connection.close()

# ------------------- Admin Users Endpoints -------------------
def require_admin():
    """Return True if the request is authenticated as an admin.

    Check order:
    1. Session (recommended normal flow)
    2. Authorization header 'Bearer <user_id>' (dev/API fallback)
    3. 'User-Id' header

    If a header is present, verify the user's role from the DB.
    """
    # 1) session
    if session.get('role') == 'admin':
        return True

    # 2) Authorization header
    user_id = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        try:
            user_id = int(auth_header.replace('Bearer ', ''))
        except ValueError:
            user_id = None

    # 3) User-Id header
    if user_id is None:
        user_id_hdr = request.headers.get('User-Id')
        if user_id_hdr:
            try:
                user_id = int(user_id_hdr)
            except ValueError:
                user_id = None

    if user_id is None:
        return False

    # Verify role from DB
    conn = get_db_connection()
    if not conn:
        return False
    cur = None
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute('SELECT role FROM User WHERE user_id = %s', (user_id,))
        row = cur.fetchone()
        if row and row.get('role') == 'admin':
            return True
    except Exception as e:
        print('require_admin DB check error:', e)
    finally:
        try:
            if cur:
                cur.close()
        except Exception:
            pass
        try:
            conn.close()
        except Exception:
            pass

    return False


@app.route('/api/admin/users', methods=['GET'])
def admin_list_users():
    if not require_admin():
        return jsonify({'error': 'Admin privileges required'}), 403

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("SELECT user_id as id, name, email, role FROM User ORDER BY user_id DESC")
        users = cursor.fetchall()
        return jsonify({'success': True, 'users': users}), 200
    except Error as e:
        print('admin_list_users error:', e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
def admin_update_user(user_id):
    if not require_admin():
        return jsonify({'error': 'Admin privileges required'}), 403

    data = request.json or {}
    name = data.get('name')
    email = data.get('email')
    role = data.get('role')

    if not name or not email or not role:
        return jsonify({'error': 'name, email, and role are required'}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor()
        cursor.execute("UPDATE User SET name=%s, email=%s, role=%s WHERE user_id=%s", (name, email, role, user_id))
        connection.commit()
        return jsonify({'success': True, 'message': 'User updated'}), 200
    except Error as e:
        connection.rollback()
        print('admin_update_user error:', e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def admin_delete_user(user_id):
    if not require_admin():
        return jsonify({'error': 'Admin privileges required'}), 403

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor()
        # Delete client-specific row if exists
        try:
            cursor.execute('DELETE FROM Client WHERE client_id = %s', (user_id,))
        except Exception:
            pass
        cursor.execute('DELETE FROM User WHERE user_id = %s', (user_id,))
        connection.commit()
        return jsonify({'success': True, 'message': 'User deleted'}), 200
    except Error as e:
        connection.rollback()
        print('admin_delete_user error:', e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# ------------------- Admin Medicines Endpoints -------------------
@app.route('/api/admin/medicines', methods=['GET'])
def admin_list_medicines():
    if not require_admin():
        return jsonify({'error': 'Admin privileges required'}), 403

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT m.medicine_id AS id, m.client_id, m.name, m.dosage, m.note AS notes,
                   u.name AS client_name
            FROM Medicine m
            LEFT JOIN User u ON m.client_id = u.user_id
            ORDER BY m.name
        """)
        meds = cursor.fetchall()
        return jsonify({'success': True, 'medicines': meds}), 200
    except Error as e:
        print('admin_list_medicines error:', e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


@app.route('/api/admin/medicines', methods=['POST'])
def admin_add_medicine():
    if not require_admin():
        return jsonify({'error': 'Admin privileges required'}), 403

    data = request.json or {}
    name = data.get('name')
    dosage = data.get('dosage')
    notes = data.get('notes')
    client_id = data.get('client_id')  # optional, may be null for global medicines

    if not name or not dosage:
        return jsonify({'error': 'name and dosage are required'}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO Medicine (client_id, name, dosage, note) VALUES (%s, %s, %s, %s)",
            (client_id, name, dosage, notes)
        )
        medicine_id = cursor.lastrowid
        connection.commit()
        return jsonify({'success': True, 'medicine_id': medicine_id}), 201
    except Error as e:
        connection.rollback()
        print('admin_add_medicine error:', e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


@app.route('/api/admin/medicines/<int:medicine_id>', methods=['PUT'])
def admin_update_medicine(medicine_id):
    if not require_admin():
        return jsonify({'error': 'Admin privileges required'}), 403

    data = request.json or {}
    name = data.get('name')
    dosage = data.get('dosage')
    notes = data.get('notes')

    if not name or not dosage:
        return jsonify({'error': 'name and dosage are required'}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor()
        cursor.execute(
            "UPDATE Medicine SET name=%s, dosage=%s, note=%s WHERE medicine_id=%s",
            (name, dosage, notes, medicine_id)
        )
        connection.commit()
        return jsonify({'success': True, 'message': 'Medicine updated'}), 200
    except Error as e:
        connection.rollback()
        print('admin_update_medicine error:', e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


@app.route('/api/admin/medicines/<int:medicine_id>', methods=['DELETE'])
def admin_delete_medicine(medicine_id):
    if not require_admin():
        return jsonify({'error': 'Admin privileges required'}), 403

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor()
        # delete related reminders first
        try:
            cursor.execute('DELETE FROM Reminder WHERE medicine_id = %s', (medicine_id,))
        except Exception:
            pass
        cursor.execute('DELETE FROM Medicine WHERE medicine_id = %s', (medicine_id,))
        connection.commit()
        return jsonify({'success': True, 'message': 'Medicine deleted'}), 200
    except Error as e:
        connection.rollback()
        print('admin_delete_medicine error:', e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# ------------------- Admin Reminders Endpoints -------------------
@app.route('/api/admin/reminders', methods=['GET'])
def admin_list_reminders():
    if not require_admin():
        return jsonify({'error': 'Admin privileges required'}), 403

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT r.reminder_id as id, r.medicine_id, m.name as medicine_name, r.reminder_time, r.status, m.client_id
            FROM Reminder r
            JOIN Medicine m ON r.medicine_id = m.medicine_id
            LEFT JOIN User u ON m.client_id = u.user_id
            ORDER BY r.reminder_time DESC
        """)
        rows = cursor.fetchall()
        # Convert datetime to string to make JSON serializable
        reminders = []
        for row in rows:
            rt = row.get('reminder_time')
            row['reminder_time'] = rt.strftime('%Y-%m-%d %H:%M:%S') if rt else None
            reminders.append(row)
        return jsonify({'success': True, 'reminders': reminders}), 200
    except Error as e:
        print('admin_list_reminders error:', e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


@app.route('/api/admin/reminders/<int:reminder_id>', methods=['DELETE'])
def admin_delete_reminder(reminder_id):
    if not require_admin():
        return jsonify({'error': 'Admin privileges required'}), 403

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor()
        cursor.execute('DELETE FROM Reminder WHERE reminder_id = %s', (reminder_id,))
        connection.commit()
        return jsonify({'success': True, 'message': 'Reminder deleted'}), 200
    except Error as e:
        connection.rollback()
        print('admin_delete_reminder error:', e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# ------------------- Admin Logs & Reports -------------------
@app.route('/api/admin/logs', methods=['GET'])
def admin_get_logs():
    if not require_admin():
        return jsonify({'error': 'Admin privileges required'}), 403

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        # Check if Log table exists
        cursor.execute("SHOW TABLES LIKE 'Log'")
        if not cursor.fetchone():
            return jsonify({'success': True, 'logs': []}), 200

        cursor.execute("""
            SELECT l.log_id as id, l.reminder_id, l.action, l.timestamp as created_at,
                   r.medicine_id, m.name as medicine_name, m.client_id, u.name as client_name
            FROM Log l
            LEFT JOIN Reminder r ON l.reminder_id = r.reminder_id
            LEFT JOIN Medicine m ON r.medicine_id = m.medicine_id
            LEFT JOIN User u ON m.client_id = u.user_id
            ORDER BY l.timestamp DESC
            LIMIT 200
        """)
        rows = cursor.fetchall()
        logs = []
        for row in rows:
            ca = row.get('created_at')
            row['created_at'] = ca.strftime('%Y-%m-%d %H:%M:%S') if ca else None
            logs.append(row)
        return jsonify({'success': True, 'logs': logs}), 200
    except Error as e:
        print('admin_get_logs error:', e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


@app.route('/api/admin/reports/summary', methods=['GET'])
def admin_reports_summary():
    if not require_admin():
        return jsonify({'error': 'Admin privileges required'}), 403

    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor()
        # Total users
        cursor.execute('SELECT COUNT(*) FROM User')
        users_count = cursor.fetchone()[0]

        # Total medicines
        cursor.execute('SELECT COUNT(*) FROM Medicine')
        meds_count = cursor.fetchone()[0]

        # Total reminders
        cursor.execute('SELECT COUNT(*) FROM Reminder')
        reminders_count = cursor.fetchone()[0]

        # Completed reminders (overall)
        cursor.execute("SELECT COUNT(*) FROM Reminder WHERE status = 'Completed'")
        completed = cursor.fetchone()[0]

        adherence = round((completed / reminders_count) * 100, 2) if reminders_count else 0.0

        return jsonify({
            'success': True,
            'users': users_count,
            'medicines': meds_count,
            'reminders': reminders_count,
            'completed_reminders': completed,
            'adherence_percent': adherence
        }), 200
    except Error as e:
        print('admin_reports_summary error:', e)
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/api/dashboard-stats', methods=['GET'])
def dashboard_stats():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Not authenticated'}), 401

    import mysql.connector
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Active medications
    cursor.execute("SELECT COUNT(*) AS count FROM medications WHERE user_id=%s AND is_active=1", (user_id,))
    active_medications = cursor.fetchone()['count']

    # Upcoming doses today
    cursor.execute("""
        SELECT COUNT(*) AS count FROM reminders 
        WHERE user_id=%s AND DATE(reminder_time)=CURDATE() AND status='pending'
    """, (user_id,))
    upcoming_doses = cursor.fetchone()['count']

    # Next dose
    cursor.execute("""
        SELECT m.name, r.reminder_time FROM reminders r
        JOIN medications m ON r.medication_id = m.id
        WHERE r.user_id=%s AND r.status='pending' AND r.reminder_time > NOW()
        ORDER BY r.reminder_time ASC LIMIT 1
    """, (user_id,))
    next_dose_row = cursor.fetchone()
    next_dose = {
        'name': next_dose_row['name'] if next_dose_row else 'None',
        'time': str(next_dose_row['reminder_time']) if next_dose_row else None
    }

    # Adherence rate (example: % of taken doses this week)
    cursor.execute("""
        SELECT 
            SUM(CASE WHEN status='taken' THEN 1 ELSE 0 END) AS taken,
            COUNT(*) AS total
        FROM reminders
        WHERE user_id=%s AND YEARWEEK(reminder_time, 1) = YEARWEEK(CURDATE(), 1)
    """, (user_id,))
    row = cursor.fetchone()
    adherence_rate = int((row['taken'] / row['total']) * 100) if row['total'] else 0

    cursor.close()
    conn.close()

    return jsonify({
        'success': True,
        'active_medications': active_medications,
        'upcoming_doses': upcoming_doses,
        'adherence_rate': adherence_rate,
        'next_dose': next_dose
    })
if __name__ == '__main__':
    app.run(debug=True, port=5000)

# ------------------ Feature Flags ------------------
@app.route('/api/feature-status', methods=['GET'])
def feature_status():
    """Public endpoint returning current feature flags."""
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor()
        # Ensure table exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS FeatureFlag (
                flag_key VARCHAR(100) PRIMARY KEY,
                flag_value VARCHAR(20)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        cursor.execute("SELECT flag_key, flag_value FROM FeatureFlag")
        rows = cursor.fetchall()
        flags = {row[0]: row[1] for row in rows}
        return jsonify(flags), 200
    except Error as e:
        print('Feature status DB error:', e)
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()


@app.route('/api/admin/feature', methods=['POST'])
def set_feature_flag():
    """Admin-only endpoint to set a feature flag. Expects JSON { key, value }"""
    # Require admin role in session
    if session.get('role') != 'admin':
        return jsonify({"error": "Admin privileges required"}), 403

    data = request.json or {}
    key = data.get('key')
    value = data.get('value')
    if not key:
        return jsonify({"error": "Missing key"}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cursor = connection.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS FeatureFlag (
                flag_key VARCHAR(100) PRIMARY KEY,
                flag_value VARCHAR(20)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)

        # Normalize value to string
        v = '1' if str(value) in ('1', 'true', 'True', 'True') or value is True else '0' if str(value) in ('0', 'false', 'False', 'False') or value is False else str(value)

        cursor.execute(
            "INSERT INTO FeatureFlag (flag_key, flag_value) VALUES (%s, %s) ON DUPLICATE KEY UPDATE flag_value = VALUES(flag_value)",
            (key, v)
        )
        connection.commit()
        return jsonify({"success": True, "key": key, "value": v}), 200
    except Error as e:
        connection.rollback()
        print('Set feature DB error:', e)
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()