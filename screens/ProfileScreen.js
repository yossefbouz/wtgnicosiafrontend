import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
    signInWithEmail,
    signUpWithEmail,
    signOut,
    fetchProfile,
    fetchUserHistory,
    fetchManageableVenuesWithOccupancy,
    incrementVenueOccupancy,
    setVenueOccupancy,
    subscribeVenueOccupancy,
} from '../lib/supabaseApi';
import { useAuth } from '../lib/authContext';

const { width } = Dimensions.get('window');
const STATUS_TAGS = ['empty', 'moderate', 'busy', 'full'];

const ProfileScreen = () => {
    const { user } = useAuth();
    const [mode, setMode] = useState('login'); // login | signup
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [university, setUniversity] = useState('');
    const [profile, setProfile] = useState(null);
    const [history, setHistory] = useState({ votes: [], interests: [], checkIns: [], favorites: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [managedVenues, setManagedVenues] = useState([]);
    const [occupancyLoading, setOccupancyLoading] = useState(false);
    const [occupancyActions, setOccupancyActions] = useState({});
    const occupancyChannel = useRef(null);
    const isManager = profile?.role === 'owner' || profile?.role === 'admin';

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const loadProfile = async () => {
        try {
            const [p, h] = await Promise.all([fetchProfile(), fetchUserHistory()]);
            if (p) {
                setProfile(p);
                setHistory(h);
            }
        } catch (err) {
            console.warn('Profile load failed', err);
        }
    };

    const normalizeOccupancy = (venue) => {
        if (!venue) return { current_count: 0, status_tag: 'empty' };
        const occ = Array.isArray(venue.occupancy) ? venue.occupancy[0] : venue.occupancy;
        return occ || { current_count: 0, status_tag: 'empty' };
    };

    const setActionState = (venueId, partial) => {
        setOccupancyActions((prev) => ({
            ...prev,
            [venueId]: { ...(prev[venueId] || {}), ...partial },
        }));
    };

    const updateVenueOccupancyLocally = (venueId, occupancy) => {
        setManagedVenues((prev) =>
            prev.map((v) => (v.id === venueId ? { ...v, occupancy } : v))
        );
    };

    const loadManagedVenues = useCallback(async () => {
        if (!user || !isManager) {
            setManagedVenues([]);
            return;
        }
        setOccupancyLoading(true);
        try {
            const data = await fetchManageableVenuesWithOccupancy({ role: profile?.role });
            setManagedVenues(data);
        } catch (err) {
            console.warn('Failed to load managed venues', err);
            Alert.alert('Occupancy', 'Could not load your venues right now.');
        } finally {
            setOccupancyLoading(false);
        }
    }, [user, isManager, profile?.role]);

    const handleOccupancyDelta = async (venueId, delta) => {
        const actionState = occupancyActions[venueId] || {};
        const reason = actionState.reason?.trim() || null;
        const venue = managedVenues.find((v) => v.id === venueId);
        const occ = normalizeOccupancy(venue);
        const atCapacity = occ.status_tag === 'busy' || occ.status_tag === 'full';
        if (delta > 0 && atCapacity) {
            Alert.alert('At capacity', 'This venue is marked busy/full. Reduce count before adding more.');
            return;
        }
        try {
            setActionState(venueId, { saving: true });
            const updated = await incrementVenueOccupancy(venueId, delta, { reason });
            updateVenueOccupancyLocally(venueId, updated);
        } catch (err) {
            console.warn('Occupancy update failed', err);
            Alert.alert('Update failed', 'Could not update occupancy right now.');
        } finally {
            setActionState(venueId, { saving: false });
        }
    };

    const handleOccupancySet = async (venueId) => {
        const actionState = occupancyActions[venueId] || {};
        const targetRaw = actionState.target;
        const venue = managedVenues.find((v) => v.id === venueId);
        const occ = normalizeOccupancy(venue);
        const targetCount = targetRaw === undefined ? (occ.current_count || 0) : Number.parseInt(targetRaw, 10);
        if (Number.isNaN(targetCount) || targetCount < 0) {
            Alert.alert('Invalid count', 'Enter a count of 0 or higher.');
            return;
        }
        const reason = actionState.reason?.trim() || null;
        try {
            setActionState(venueId, { saving: true });
            const updated = await setVenueOccupancy(venueId, targetCount, { reason });
            updateVenueOccupancyLocally(venueId, updated);
        } catch (err) {
            console.warn('Occupancy set failed', err);
            Alert.alert('Update failed', 'Could not set occupancy right now.');
        } finally {
            setActionState(venueId, { saving: false });
        }
    };

    const handleStatusTag = async (venueId, tag) => {
        const venue = managedVenues.find((v) => v.id === venueId);
        const occ = normalizeOccupancy(venue);
        const actionState = occupancyActions[venueId] || {};
        const reason = actionState.reason?.trim() || `Set status to ${tag}`;
        try {
            setActionState(venueId, { savingTag: tag });
            const updated = await setVenueOccupancy(venueId, occ.current_count || 0, { reason, statusTag: tag });
            updateVenueOccupancyLocally(venueId, updated);
        } catch (err) {
            console.warn('Status update failed', err);
            Alert.alert('Update failed', 'Could not update status tag.');
        } finally {
            setActionState(venueId, { savingTag: null });
        }
    };

    useEffect(() => {
        if (user) {
            loadProfile();
        } else {
            setProfile(null);
            setHistory({ votes: [], interests: [], checkIns: [], favorites: [] });
        }
    }, [user]);

    useEffect(() => {
        if (!isManager) {
            setManagedVenues([]);
            if (occupancyChannel.current?.unsubscribe) {
                occupancyChannel.current.unsubscribe();
            }
            return;
        }
        loadManagedVenues();
        const channel = subscribeVenueOccupancy(() => loadManagedVenues());
        occupancyChannel.current = channel;
        return () => {
            if (channel?.unsubscribe) {
                channel.unsubscribe();
            }
        };
    }, [isManager, loadManagedVenues]);

    const isValidEmail = (value) => /\S+@\S+\.\S+/.test(value);

    const handleLogin = async () => {
        setError('');
        if (!email || !password) return setError('Email and password required');
        if (!isValidEmail(email)) return setError('Enter a valid email');
        setLoading(true);
        try {
            await signInWithEmail({ email, password });
            await loadProfile();
            Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
                fadeAnim.setValue(0);
                slideAnim.setValue(50);
                scaleAnim.setValue(0.9);
            });
        } catch (err) {
            const msg = err?.message || 'Login failed';
            if (msg.toLowerCase().includes('email not confirmed')) {
                setError('Please confirm your email before logging in.');
            } else if (msg.toLowerCase().includes('invalid login')) {
                setError('Invalid email or password.');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        setError('');
        if (!email || !password || !confirmPassword) return setError('Fill all fields');
        if (!isValidEmail(email)) return setError('Enter a valid email');
        if (password.length < 6) return setError('Password must be at least 6 characters');
        if (password !== confirmPassword) return setError('Passwords must match');
        setLoading(true);
        try {
            await signUpWithEmail({ email, password, displayName, university });
            Alert.alert('Check your email', 'We sent a verification link. After confirming, log in.');
            setMode('login');
        } catch (err) {
            const msg = err?.message || 'Signup failed';
            if (msg.toLowerCase().includes('already registered')) {
                setError('Email already registered. Try logging in.');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        setProfile(null);
        setHistory({ votes: [], interests: [], checkIns: [], favorites: [] });
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    };

    const userProfile = profile || {
        display_name: 'Guest',
        bio: 'Sign in to see your stats',
    };

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <Animated.View style={[
                            styles.loginContent,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    { translateY: slideAnim },
                                    { scale: scaleAnim }
                                ]
                            }
                        ]}>
                            <View style={styles.header}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="person" size={40} color={COLORS.primary} />
                                </View>
                                <Text style={styles.title}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</Text>
                                <Text style={styles.subtitle}>{mode === 'login' ? 'Sign in to access your profile' : 'Sign up with email + password'}</Text>
                            </View>

                            <View style={styles.form}>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="mail-outline" size={20} color={COLORS.muted} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        placeholderTextColor={COLORS.muted}
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                    />
                                </View>

                                <View style={styles.inputContainer}>
                                    <Ionicons name="lock-closed-outline" size={20} color={COLORS.muted} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password"
                                        placeholderTextColor={COLORS.muted}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>

                                {mode === 'signup' && (
                                    <>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="lock-closed" size={20} color={COLORS.muted} style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Confirm Password"
                                                placeholderTextColor={COLORS.muted}
                                                value={confirmPassword}
                                                onChangeText={setConfirmPassword}
                                                secureTextEntry
                                            />
                                        </View>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="person-circle" size={20} color={COLORS.muted} style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Display Name"
                                                placeholderTextColor={COLORS.muted}
                                                value={displayName}
                                                onChangeText={setDisplayName}
                                            />
                                        </View>
                                        <View style={styles.inputContainer}>
                                            <Ionicons name="school-outline" size={20} color={COLORS.muted} style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="University (optional)"
                                                placeholderTextColor={COLORS.muted}
                                                value={university}
                                                onChangeText={setUniversity}
                                            />
                                        </View>
                                    </>
                                )}

                                {!!error && <Text style={styles.errorText}>{error}</Text>}

                                <TouchableOpacity
                                    style={styles.loginButton}
                                    onPress={mode === 'login' ? handleLogin : handleSignup}
                                    activeOpacity={0.8}
                                    disabled={loading}
                                >
                                    <LinearGradient
                                        colors={[COLORS.primary, COLORS.primaryBright]}
                                        style={styles.gradientButton}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.loginButtonText}>{mode === 'login' ? 'Log In' : 'Sign Up'}</Text>
                                        <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                                    </LinearGradient>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')} style={styles.switchMode}>
                                    <Text style={styles.switchModeText}>
                                        {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.profileScroll}>
                <Animated.View style={[
                    styles.profileContent,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }]
                    }
                ]}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop' }}
                                style={styles.avatar}
                            />
                            <View style={styles.onlineBadge} />
                        </View>
                        <Text style={styles.userName}>{userProfile.display_name || userProfile.email}</Text>
                        <Text style={styles.userBio}>{profile?.university || 'Ready to find the next vibe.'}</Text>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={[styles.statCard, { borderColor: 'rgba(0, 255, 133, 0.3)' }]}>
                            <View style={[styles.statIcon, { backgroundColor: 'rgba(0, 255, 133, 0.1)' }]}>
                                <Ionicons name="thumbs-up" size={24} color={COLORS.success} />
                            </View>
                            <Text style={[styles.statNumber, { color: COLORS.success }]}>{history.votes.filter(v => v.status === 'yes').length}</Text>
                            <Text style={styles.statLabel}>Yes votes</Text>
                        </View>

                    <View style={[styles.statCard, { borderColor: 'rgba(255, 77, 77, 0.3)' }]}>
                        <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 77, 77, 0.1)' }]}>
                            <Ionicons name="calendar" size={24} color={COLORS.primary} />
                        </View>
                        <Text style={[styles.statNumber, { color: COLORS.primary }]}>{history.interests.length}</Text>
                        <Text style={styles.statLabel}>Events saved</Text>
                    </View>
                </View>

                {isManager && (
                    <View style={styles.occupancySection}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionTitle}>Venue Occupancy</Text>
                            {occupancyLoading && <ActivityIndicator color={COLORS.primary} />}
                        </View>
                        {!occupancyLoading && managedVenues.length === 0 && (
                            <Text style={styles.emptyText}>No venues assigned to your account yet.</Text>
                        )}
                        {managedVenues.map((venue) => {
                            const occ = normalizeOccupancy(venue);
                            const actionState = occupancyActions[venue.id] || {};
                            const atCapacity = occ.status_tag === 'busy' || occ.status_tag === 'full';
                            return (
                                <View key={venue.id} style={styles.occupancyCard}>
                                    <View style={styles.occRow}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.occVenueName}>{venue.name}</Text>
                                            <Text style={styles.occVenueMeta}>{venue.address || venue.city || 'Nicosia'}</Text>
                                        </View>
                                        <View style={styles.statusPill}>
                                            <Text style={styles.statusPillText}>{(occ.status_tag || 'empty').toUpperCase()}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.countRow}>
                                        <Text style={styles.countLabel}>Current</Text>
                                        <Text style={styles.countValue}>{occ.current_count ?? 0}</Text>
                                    </View>

                                    <View style={styles.controlRow}>
                                        <TouchableOpacity
                                            style={[styles.controlButton, actionState.saving && styles.controlButtonDisabled]}
                                            onPress={() => handleOccupancyDelta(venue.id, -1)}
                                            disabled={actionState.saving}
                                        >
                                            <Text style={styles.controlButtonText}>-1</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.controlButton, actionState.saving && styles.controlButtonDisabled]}
                                            onPress={() => handleOccupancyDelta(venue.id, -20)}
                                            disabled={actionState.saving}
                                        >
                                            <Text style={styles.controlButtonText}>-20</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.controlButton, (actionState.saving || atCapacity) && styles.controlButtonDisabled]}
                                            onPress={() => handleOccupancyDelta(venue.id, 1)}
                                            disabled={actionState.saving || atCapacity}
                                        >
                                            <Text style={styles.controlButtonText}>+1</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.controlButton, (actionState.saving || atCapacity) && styles.controlButtonDisabled]}
                                            onPress={() => handleOccupancyDelta(venue.id, 5)}
                                            disabled={actionState.saving || atCapacity}
                                        >
                                            <Text style={styles.controlButtonText}>+5</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.setRow}>
                                        <View style={[styles.inputContainer, { flex: 1 }]}>
                                            <Ionicons name="people-outline" size={20} color={COLORS.muted} style={styles.inputIcon} />
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Set count"
                                                placeholderTextColor={COLORS.muted}
                                                value={actionState.target !== undefined ? String(actionState.target) : String(occ.current_count ?? 0)}
                                                onChangeText={(text) => setActionState(venue.id, { target: text })}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                        <TouchableOpacity
                                            style={[styles.applyButton, actionState.saving && styles.applyButtonDisabled]}
                                            onPress={() => handleOccupancySet(venue.id)}
                                            disabled={actionState.saving}
                                        >
                                            <Text style={styles.applyButtonText}>Set</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.applyButton, styles.resetButton, actionState.saving && styles.applyButtonDisabled]}
                                            onPress={() => {
                                                setActionState(venue.id, { ...actionState, target: 0, reason: actionState.reason || 'Reset after event' });
                                                handleOccupancySet(venue.id);
                                            }}
                                            disabled={actionState.saving}
                                        >
                                            <Text style={styles.applyButtonText}>Reset</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {atCapacity && (
                                        <Text style={styles.capacityNote}>
                                            Marked busy/full — add more only after dropping by 20.
                                        </Text>
                                    )}

                                    <View style={styles.tagRow}>
                                        {STATUS_TAGS.map((tag) => {
                                            const active = occ.status_tag === tag;
                                            const savingTag = actionState.savingTag === tag;
                                            return (
                                                <TouchableOpacity
                                                    key={tag}
                                                    style={[styles.tagChip, active && styles.tagChipActive, (actionState.saving || savingTag) && styles.controlButtonDisabled]}
                                                    onPress={() => handleStatusTag(venue.id, tag)}
                                                    disabled={actionState.saving}
                                                >
                                                    <Text style={[styles.tagChipText, active && styles.tagChipTextActive]}>
                                                        {savingTag ? '...' : tag.toUpperCase()}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>

                                    <View style={[styles.inputContainer, { marginTop: 12 }]}>
                                        <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.muted} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Reason (optional)"
                                            placeholderTextColor={COLORS.muted}
                                            value={actionState.reason || ''}
                                            onChangeText={(text) => setActionState(venue.id, { reason: text })}
                                        />
                                    </View>

                                    <Text style={styles.updatedText}>
                                        Updated {occ.updated_at ? new Date(occ.updated_at).toLocaleString() : 'n/a'}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                )}

                <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIconContainer}>
                        <Ionicons name="settings-outline" size={22} color={COLORS.white} />
                    </View>
                    <Text style={styles.menuText}>Settings</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
                        </View>
                        <Text style={styles.menuText}>Notifications</Text>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.logoutButton]}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SIZES.padding,
    },
    loginContent: {
        width: '100%',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(111, 0, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    title: {
        ...FONTS.h1,
        color: COLORS.white,
        marginBottom: 8,
    },
    subtitle: {
        ...FONTS.body,
        color: COLORS.muted,
    },
    form: {
        gap: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radius,
        paddingHorizontal: 15,
        height: 60,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: COLORS.white,
        ...FONTS.body,
    },
    errorText: {
        color: COLORS.error,
        ...FONTS.body,
        textAlign: 'center',
    },
    loginButton: {
        marginTop: 20,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        gap: 10,
    },
    loginButtonText: {
        color: COLORS.white,
        ...FONTS.h3,
    },
    switchMode: {
        alignItems: 'center',
        marginTop: 10,
    },
    switchModeText: {
        color: COLORS.text,
        ...FONTS.bodyMedium,
    },
    profileScroll: {
        padding: SIZES.padding,
        paddingBottom: 100,
    },
    profileContent: {
        width: '100%',
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 20,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: COLORS.primary,
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.success,
        borderWidth: 3,
        borderColor: COLORS.background,
    },
    userName: {
        ...FONTS.h1,
        color: COLORS.white,
        marginBottom: 8,
    },
    userBio: {
        ...FONTS.body,
        color: COLORS.muted,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 30,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.card,
        padding: 20,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        borderWidth: 1,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    statNumber: {
        fontSize: 28,
        fontFamily: 'Montserrat-Bold',
        marginBottom: 4,
    },
    statLabel: {
        ...FONTS.body,
        color: COLORS.muted,
        fontSize: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        padding: 16,
        borderRadius: SIZES.radius,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    menuText: {
        flex: 1,
        color: COLORS.white,
        ...FONTS.bodyMedium,
    },
    logoutButton: {
        marginTop: 20,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutText: {
        color: COLORS.error,
        ...FONTS.bodyMedium,
    },
    occupancySection: {
        marginBottom: 20,
        gap: 12,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    emptyText: {
        color: COLORS.muted,
        ...FONTS.body,
    },
    occupancyCard: {
        backgroundColor: COLORS.card,
        borderRadius: SIZES.radius,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 12,
    },
    occRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    occVenueName: {
        ...FONTS.h3,
        color: COLORS.white,
    },
    occVenueMeta: {
        ...FONTS.body,
        color: COLORS.muted,
        marginTop: 2,
    },
    statusPill: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(111, 0, 255, 0.12)',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statusPillText: {
        color: COLORS.primary,
        ...FONTS.bodyMedium,
        fontSize: 12,
    },
    countRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    countLabel: {
        color: COLORS.muted,
        ...FONTS.body,
    },
    countValue: {
        ...FONTS.h1,
        color: COLORS.white,
    },
    controlRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    controlButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    controlButtonDisabled: {
        opacity: 0.5,
    },
    controlButtonText: {
        ...FONTS.bodyMedium,
        color: COLORS.white,
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    applyButton: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.primary,
    },
    applyButtonDisabled: {
        opacity: 0.6,
    },
    resetButton: {
        backgroundColor: COLORS.error,
        marginLeft: 6,
    },
    applyButtonText: {
        ...FONTS.bodyMedium,
        color: COLORS.white,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    tagChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
    },
    tagChipActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    tagChipText: {
        ...FONTS.bodyMedium,
        color: COLORS.text,
        fontSize: 12,
    },
    tagChipTextActive: {
        color: COLORS.white,
    },
    updatedText: {
        marginTop: 10,
        color: COLORS.muted,
        ...FONTS.small,
    },
    capacityNote: {
        marginTop: 6,
        color: COLORS.muted,
        ...FONTS.small,
    },
});

export default ProfileScreen;
